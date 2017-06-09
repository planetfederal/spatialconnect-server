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
            [spacon.components.queue.protocol :as queueapi]
            [clojure.data.json :as json]
            [clojure.tools.logging :as log]
            [clojure.core.async :as async]
            [clj-time.local :as l]
            [spacon.entity.msg :as msg])
  (:import [java.util.concurrent Executors TimeUnit]))

(defn- send-ping [queue-comp]
  (let [ping-msg (json/write-str {:type "ping"
                                  :timestamp (l/format-local-time (l/local-now) :date-time-no-ms)})]
    (queueapi/publish queue-comp
                      (msg/map->Msg
                       {:topic "test"
                        :value ping-msg
                        :key "anykey"
                        :partition 0}))))

(defn- ping-queue
  "Sends a record to queue every 5 seconds as a heartbeat."
  [queue-comp]
  (let [pool (Executors/newScheduledThreadPool 1)]
    (.scheduleAtFixedRate pool #(send-ping queue-comp) 0 20 TimeUnit/SECONDS)))

(defn queue-ping
  "Responds with pong as a way to ensure queue broker is reachable"
  [queue-comp message]
  (queueapi/publish queue-comp
                    (assoc message :payload {:result "pong"})))

(defrecord PingComponent [queue]
  component/Lifecycle
  (start [this]
    (log/debug "Starting Ping Component")
    (queueapi/subscribe queue :ping (partial queue-ping queue))
    this)
  (stop [this]
    (log/debug "Stopping Ping Component")
    this))

(defn make-ping-component []
  (map->PingComponent {}))
