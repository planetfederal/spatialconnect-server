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

(ns spacon.components.device.core
  (:require [com.stuartsierra.component :as component]
            [spacon.components.http.intercept :as intercept]
            [yesql.core :refer [defqueries]]
            [spacon.components.device.db :as devicemodel]
            [spacon.components.queue.protocol :as queueapi]
            [clojure.tools.logging :as log]))

(defn all
  [device-comp]
  (devicemodel/all))

(defn find-by-identifier
  [device-comp id]
  (devicemodel/find-by-identifier id))

(defn create
  [device-comp device]
  (devicemodel/create device))

(defn modify
  [device-comp id device]
  (devicemodel/modify id device))

(defn delete
  [device-comp id]
  (devicemodel/delete id))

(defn- queue->update
  "Queue message handler that updates device info"
  [msg]
  (let [device (:payload msg)]
    (log/debugf "Updating device info" device)
    (devicemodel/modify (:identifier device) device)))

(defrecord DeviceComponent [queue]
  component/Lifecycle
  (start [this]
    (log/debug "Starting Device Component")
    (queueapi/subscribe queue :device-info queue->update)
    this)
  (stop [this]
    (log/debug "Stopping Device Component")
    this))

(defn make-device-component []
  (map->DeviceComponent {}))
