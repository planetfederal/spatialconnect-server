;; Copyright 2016-2017 Boundless, http://boundlessgeo.com
;;
;; Licensed under the Apache License, Version 2.0 (the "License");
;; you may not use this file except in compliance with the License.
;; You may obtain a copy of the License at
;;
;; http://www.apache.org/licenses/LICENSE-2.0
;;
;; Unless required by applicable law or agreed to in writing, software
;; distributed under the License is distributed on an "AS IS" BASIS,
;; WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
;; See the License for the specific language governing permissions and
;; limitations under the License.

(ns spacon.components.location.core
  (:require [com.stuartsierra.component :as component]
            [spacon.components.http.intercept :as intercept]
            [spacon.components.http.response :as response]
            [clojure.data.json :as json]
            [yesql.core :refer [defqueries]]
            [spacon.components.mqtt.core :as mqttapi]
            [spacon.components.trigger.core :as triggerapi]
            [spacon.components.location.db :as locationmodel]
            [clojure.tools.logging :as log]
            [cljts.io :as jtsio]))

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
    (let [gj (-> (:payload message)
                 json/write-str
                 jtsio/read-feature
                 .getDefaultGeometry)]
      (triggerapi/test-value trigger "location" gj))))

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
