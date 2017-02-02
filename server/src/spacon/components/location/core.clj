(ns spacon.components.location.core
  (:require [com.stuartsierra.component :as component]
            [spacon.http.intercept :as intercept]
            [spacon.http.response :as response]
            [clojure.data.json :as json]
            [yesql.core :refer [defqueries]]
            [spacon.components.mqtt.core :as mqttapi]
            [spacon.components.trigger.core :as triggerapi]
            [spacon.components.location.db :as locationmodel]
            [clojure.tools.logging :as log]))

(defn location->geojson
  "Given list of locations, returns a lazy sequence of geojson
  features with device metadata for each location"
  [locations]
  (map (fn [l]
         {:type     "Feature"
          :id       (:identifier l)
          :geometry {:type        "Point"
                     :coordinates [(.getX (:geometry l)) (.getY (:geometry l))]}
          :metadata {:client     (:identifier l)
                     :updated_at (:updated_at l)}})
       locations))

(defn update-device-location
  "MQTT message handler that persists the device location
  of the message body, then tests it against the triggers"
  [trigger message]
  (log/debugf "Received device location update message %s" (:payload message))
  (let [loc (:payload message)]
    (locationmodel/upsert-gj loc)
    (triggerapi/test-value trigger "location" loc)))

(defn http-get-all-locations
  "Returns the latest location of each device"
  [_]
  (log/debug "Getting all device locations")
  (let [fs (location->geojson (locationmodel/all))]
    (response/ok {:type "FeatureCollection"
                  :features fs})))

(defn- routes [] #{["/api/locations" :get
                    (conj intercept/common-interceptors `http-get-all-locations)]})

(defrecord LocationComponent [mqtt trigger]
  component/Lifecycle
  (start [this]
    (log/debug "Starting Location Component")
    (mqttapi/subscribe mqtt "/store/tracking" (partial update-device-location trigger))
    (assoc this :routes (routes)))
  (stop [this]
    (log/debug "Stopping Location Component")
    this))

(defn make-location-component []
  (map->LocationComponent {}))
