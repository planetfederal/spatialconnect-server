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
            [spacon.components.mqtt.core :as mqttapi]
            [clojure.data.json :as json]
            [clojure.tools.logging :as log]
            [spacon.components.kafka.core :as kafka]
            [clojure.core.async :as async]
            [clj-time.local :as l])
  (:import [java.util.concurrent Executors TimeUnit]))

(defn- pong
  "Responds with pong as a way to ensure http service is reachable"
  [request]
  (response/ok "pong"))

(defn pong-kafka
  "Subscribes to test topic and awaits pong message to ensure kafka cluster is reachable"
  [producer-component request]
  (let [record {:topic "test"
                :key "anykey"
                :value (json/write-str (:json-params request))}
        promise-chan (kafka/send! producer-component record)
        [val ch] (async/alts!! [promise-chan (async/timeout 2000)])]
    (if (nil? val)
      (response/error "Error writing to Kafka or timeout")
      (response/ok val))))

(defn- send-ping [kafka-producer]
  (let [ping-msg (json/write-str {:type "ping"
                                  :timestamp (l/format-local-time (l/local-now) :date-time-no-ms)})]
    (kafka/send! kafka-producer {:topic "test"
                                 :value ping-msg
                                 :key "anykey"
                                 :partition 0})))

(defn- ping-kafka
  "Sends a record to kafka every 5 seconds as a heartbeat."
  [kafka-producer]
  (let [pool (Executors/newScheduledThreadPool 1)]
    (.scheduleAtFixedRate pool #(send-ping kafka-producer) 0 5 TimeUnit/SECONDS)))

(defn mqtt-ping
  "Responds with pong as a way to ensure mqtt broker is reachable"
  [mqttcomp message]
  (mqttapi/publish-scmessage mqttcomp
                             (:reply-to message)
                             (assoc message :payload {:result "pong"})))

(defn- routes
  [kafka-producer]
  #{["/api/ping" :get (conj intercept/common-interceptors `pong)]
    ["/api/ping/kafka" :post (conj intercept/common-interceptors (partial pong-kafka kafka-producer)) :route-name :pong-kafka]})

(defrecord PingComponent [mqtt kafka-producer]
  component/Lifecycle
  (start [this]
    (log/debug "Starting Ping Component")
    (mqttapi/subscribe mqtt "/ping" (partial mqtt-ping mqtt))
    (ping-kafka kafka-producer)
    (assoc this :routes (routes kafka-producer)))
  (stop [this]
    (log/debug "Stopping Ping Component")
    this))

(defn make-ping-component []
  (map->PingComponent {}))
