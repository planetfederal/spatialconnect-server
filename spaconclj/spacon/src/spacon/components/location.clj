(ns spacon.components.location
  (:require [com.stuartsierra.component :as component]
            [spacon.http.intercept :as intercept]
            [spacon.http.response :as response]
            [clojure.data.json :as json]
            [spacon.db.conn :as db]
            [ring.util.response :as ring-resp]
            [yesql.core :refer [defqueries]]
            [spacon.components.mqtt :as mqttcomp]
            [spacon.util.protobuf :as pbf]
            [spacon.models.locations :as model]))

(defn location->geojson [locations]
  (map (fn [l]
         {:type     "Feature"
          :id       (:identifier l)
          :geometry {:type        "Point"
                     :coordinates [(.getX (:geometry l)) (.getY (:geometry l))]}

          :metadata {:client     (:identifier l)
                     :updated_at (:updated_at l)}
          }) locations))

(defn http-get [_]
  (let [fs (location->geojson (model/locations))]
    (response/ok {:type "FeatureCollection"
                  :features fs})))

(defn- routes [] #{["/api/location" :get
                    (conj intercept/common-interceptors `http-get)]})

(defrecord LocationComponent [mqtt trigger]
  component/Lifecycle
  (start [this]
    (mqttcomp/listenOnTopic mqtt "/store/tracking"
      (fn [s]
        (let [payload (:payload (pbf/bytes->map s))] (model/upsert-location-gj (json/read-str payload)))))
    (assoc this :routes (routes)))
  (stop [this]
    this))

(defn make-location-component []
  (map->LocationComponent {}))
