(ns spacon.components.location
  (:require [com.stuartsierra.component :as component]
            [spacon.http.intercept :as intercept]
            [clojure.data.json :as json]
            [ring.util.response :as ring-resp]
            [spacon.db.conn :as db]
            [yesql.core :refer [defqueries]]))

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

(defn location->geojson [locations]
  (map (fn [l]
         {:type     "Feature"
          :id       (:identifier l)
          :geometry {:type        "Point"
                     :coordinates [(:x l) (:y l) (:z l)]
                     }
          :metadata {:device     {:device_info (:device_info l)
                                  :identifier  (:identifier l)
                                  }
                     :updated_at (:updated_at l)
                     }
          }) locations))

(defn http-get [context]
  (let [fs (location->geojson (locations))]
    (ring-resp/response {:response {:type     "FeatureCollection"
                                    :features fs}})))

(defn- routes [] #{["/api/location" :get
                    (conj intercept/common-interceptors `http-get)]})

(defrecord LocationComponent []
  component/Lifecycle
  (start [this]
    (assoc this :routes (routes)))
  (stop [this]
    this))

(defn make-location-component []
  (->LocationComponent))