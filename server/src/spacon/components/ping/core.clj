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
            [spacon.components.http.intercept :as intercept]
            [spacon.components.http.response :as response]
            [spacon.components.kafka.core :as kafkaapi]
            [clojure.data.json :as json]
            [clojure.tools.logging :as log]
            [spacon.components.kafka.core :as kafka]
            [clojure.core.async :as async]
            [clj-time.local :as l])
  (:import [java.util.concurrent Executors TimeUnit]))

(defn- send-ping [kafka-comp]
  (let [ping-msg (json/write-str {:type "ping"
                                  :timestamp (l/format-local-time (l/local-now) :date-time-no-ms)})]
    (kafkaapi/publish kafka-comp {:topic "test"
                                 :value ping-msg
                                 :key "anykey"
                                 :partition 0})))

(defn- ping-kafka
  "Sends a record to kafka every 5 seconds as a heartbeat."
  [kafka-comp]
  (let [pool (Executors/newScheduledThreadPool 1)]
    (.scheduleAtFixedRate pool #(send-ping kafka-comp) 0 20 TimeUnit/SECONDS)))

(defn kafka-ping
  "Responds with pong as a way to ensure kafka broker is reachable"
  [kafkacomp message]
  (kafkaapi/publish kafkacomp
                             (assoc message :payload {:result "pong"})))

(defrecord PingComponent [kafka]
  component/Lifecycle
  (start [this]
    (log/debug "Starting Ping Component")
    (kafkaapi/subscribe kafka "/ping" (partial kafka-ping kafka))
    this)
  (stop [this]
    (log/debug "Stopping Ping Component")
    this))

(defn make-ping-component []
  (map->PingComponent {}))
