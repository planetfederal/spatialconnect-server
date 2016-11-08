(ns spacon.components.location
  (:require [com.stuartsierra.component :as component]
            [spacon.http.intercept :as intercept]
            [clojure.data.json :as json]
            [ring.util.response :as ring-resp]
            [spacon.db.conn :as db]
            [yesql.core :refer [defqueries]]
            [spacon.components.mqtt :as mqttcomp]
            [spacon.util.protobuf :as pbf]))

(defqueries "sql/location.sql"
            {:connection db/db-spec})

(defn entity->map [c]
  (assoc c :device_info (if-let [v (:device_info c)]
                          (json/read-str (.getValue v))
                          nil)
           :updated_at (.toString (:updated_at c))))

(defn locations []
  (map (fn [d]
         (entity->map d)) (device-locations)))

(defn upsert-location [loc]
  (let [x (get-in loc [:geometry :coordinates 0])
        y (get-in loc [:geometry :coordinates 1])
        z (get-in loc [:geometry :coordinates 2])
        did (get-in loc [:metadata :client])]
    (upsert-location! {:x x :y y :z z :device_id did})))

(defn location->geojson [locations]
  (map (fn [l]
         {:type     "Feature"
          :id       (:identifier l)
          :geometry {:type        "Point"
                     :coordinates [(:x l) (:y l) (:z l)]}

          :metadata {:client     (:identifier l)
                     :updated_at (:updated_at l)}
          }) locations))

(defn http-get [context]
  (let [fs (location->geojson (locations))]
    (ring-resp/response {:response {:type     "FeatureCollection"
                                    :features fs}})))

(defn- routes [] #{["/api/location" :get
                    (conj intercept/common-interceptors `http-get)]})

(defrecord LocationComponent [mqtt trigger]
  component/Lifecycle
  (start [this]
    (mqttcomp/listenOnTopic mqtt "/store/tracking" (fn [s]
                                                     (let [payload (:payload (pbf/bytes->map s))]
                                                       (upsert-location (json/read-str payload)))))
    (assoc this :routes (routes)))
  (stop [this]
    this))

(defn make-location-component []
  (map->LocationComponent {}))