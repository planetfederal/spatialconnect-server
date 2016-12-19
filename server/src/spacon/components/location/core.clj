(ns spacon.components.location.core
  (:require [com.stuartsierra.component :as component]
            [spacon.http.intercept :as intercept]
            [spacon.http.response :as response]
            [clojure.data.json :as json]
            [yesql.core :refer [defqueries]]
            [spacon.components.mqtt.core :as mqttapi]
            [spacon.components.trigger.core :as triggerapi]
            [spacon.components.location.db :as locationmodel]))

(defn location->geojson [locations]
  (map (fn [l]
         {:type     "Feature"
          :id       (:identifier l)
          :geometry {:type        "Point"
                     :coordinates [(.getX (:geometry l)) (.getY (:geometry l))]}
          :metadata {:client     (:identifier l)
                     :updated_at (:updated_at l)}})
       locations))

(defn http-get [_]
  (let [fs (location->geojson (locationmodel/all))]
    (response/ok {:type "FeatureCollection"
                  :features fs})))

(defn- routes [] #{["/api/locations" :get
                    (conj intercept/common-interceptors `http-get)]})

(defrecord LocationComponent [mqtt trigger]
  component/Lifecycle
  (start [this]
    (mqttapi/subscribe mqtt "/store/tracking"
                        (fn [message]
                          (let [loc (:payload message)]
                            (locationmodel/upsert-gj loc)
                            (triggerapi/test-value trigger "location" loc))))
    (assoc this :routes (routes)))
  (stop [this]
    this))

(defn make-location-component []
  (map->LocationComponent {}))
