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
            [clojure.data.json :as json]
            [yesql.core :refer [defqueries]]
            [spacon.components.mqtt.core :as mqttapi]
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

(defn locations
  [location-comp]
  (location->geojson (locationmodel/all)))

(defn- update-device-location
  "MQTT message handler that persists the device location
  of the message body, then tests it against the triggers"
  [message]
  (log/debugf "Received device location update message %s" (:payload message))
  (let [loc (:payload message)]
    (locationmodel/upsert-gj loc)))

(defrecord LocationComponent [mqtt]
  component/Lifecycle
  (start [this]
    (log/debug "Starting Location Component")
    (mqttapi/subscribe mqtt "/store/tracking" update-device-location)
    this)
  (stop [this]
    (log/debug "Stopping Location Component")
    this))

(defn make-location-component []
  (map->LocationComponent {}))
