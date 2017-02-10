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

(ns spacon.components.ping.core
  (:require [com.stuartsierra.component :as component]
            [spacon.http.intercept :as intercept]
            [spacon.http.response :as response]
            [spacon.components.mqtt.core :as mqttapi]
            [clojure.data.json :as json]
            [clojure.tools.logging :as log]))

(defn- pong
  "Responds with pong as a way to ensure http service is reachable"
  [request]
  (response/ok "pong"))

(defn- routes [] #{["/api/ping"
                    :get
                    (conj intercept/common-interceptors `pong)]})

(defn mqtt-ping
  "Responds with pong as a way to ensure mqtt broker is reachable"
  [mqttcomp message]
  (mqttapi/publish-scmessage mqttcomp
                             (:reply-to message)
                             (assoc message :payload {:result "pong"})))

(defrecord PingComponent [mqtt]
  component/Lifecycle
  (start [this]
    (log/debug "Starting Ping Component")
    (mqttapi/subscribe mqtt "/ping" (partial mqtt-ping mqtt))
    (assoc this :routes (routes)))
  (stop [this]
    (log/debug "Stopping Ping Component")
    this))

(defn make-ping-component []
  (map->PingComponent {}))
