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

(ns spacon.components.mqtt.core
  (:require [com.stuartsierra.component :as component]
            [clojurewerkz.machine-head.client :as mh]
            [spacon.entity.scmessage :as scm]
            [clojure.core.async :as async]
            [spacon.components.http.auth :refer [get-token]]
            [clojure.tools.logging :as log])
  (:import [org.apache.kafka.clients.producer KafkaProducer]
           [org.apache.kafka.clients.consumer ConsumerConfig KafkaConsumer]
           [org.apache.kafka.common.serialization Serializer StringSerializer Deserializer StringDeserializer]))

(def client-id "spacon-server")

(def commands
  "Map of topics as keys and message handler functions as values"
  (ref {}))

(defn- add-command
  "Transactionally adds topic to topics ref"
  [cmd fn]
  (log/trace "Adding command " cmd)
  (dosync
   (commute commands assoc (keyword cmd) fn)))

(defn- remove-command
  "Transactionally removes command from commands ref"
  [cmd]
  (log/trace "Removing command " cmd)
  (dosync
   (commute commands dissoc (keyword cmd))))

; publishes message on the send channel
(defn- publish [pub-chan message]
  (async/go (async/>!! pub-chan (scm/message->bytes message))))

; receive message on subscribe channel
(defn- receive [rec-chan topic message]
  (log/tracef "Received message on topic %s %nmessage:%s" topic message)
  (if (nil? message)
    (log/debug "Nil message on topic " topic)
    (async/go (async/>!! rec-chan (scm/from-bytes message)))))

(defn subscribe
  "Subscribe to mqtt topic with message handler function f"
  [kafka-comp cmd f]
  (log/debug "Subscribing to command " cmd)
  (add-command cmd f)
  (mh/subscribe (:conn mqtt) {topic 2} (fn [^String topic _ ^bytes payload]
                                         (receive mqtt topic payload))))

(defn unsubscribe
  "Unsubscribe to mqtt topic"
  [mqtt cmd]
  (log/debug "Unsubscribing to command" cmd)
  (remove-command cmd))

(defn construct-producer
  "Construct and return a KafkaProducer using the producer-config map
  (See https://kafka.apache.org/documentation.html#producerconfigs
  for more details about the config)"
  [producer-config]
  (let [{:keys [servers timeout-ms client-id config key-serializer value-serializer]
         :or   {config           {}
                key-serializer   (StringSerializer.)
                value-serializer (StringSerializer.)
                client-id        (str "sc-producer-" (.getHostName (java.net.InetAddress/getLocalHost)))}}
        producer-config]
    (KafkaProducer. ^java.util.Map
                    (assoc config
                      "request.timeout.ms" (str timeout-ms)
                      "bootstrap.servers" servers
                      "client.id" client-id
                      "acks" "all")
                    ^Serializer key-serializer
                    ^Serializer value-serializer)))

(defn construct-consumer
  [consumer-config]
  (let [{:keys [servers client-id key-deserializer value-deserializer]
         :or   {client-id        (str "sc-consumer-" (.getHostName (java.net.InetAddress/getLocalHost)))
                servers          "localhost:9092"
                key-deserializer   (StringDeserializer.)
                value-deserializer (StringDeserializer.)}} consumer-config]
    (KafkaConsumer. ^java.util.Map
                    (assoc {}
                      ConsumerConfig/CLIENT_ID_CONFIG client-id
                      ConsumerConfig/GROUP_ID_CONFIG client-id
                      ConsumerConfig/BOOTSTRAP_SERVERS_CONFIG servers)
                    ^Deserializer key-deserializer
                    ^Deserializer value-deserializer)))

(defn- process-send-topic [producer chan]
  (async/go (while true
              (let [v (async/<!! chan)
                    t (:topic v)
                    m (:message v)]
                (try
                  (if-not (or (nil? t) (nil? m))
                    (mh/publish (:conn mqtt) t m))
                  (catch Exception e
                    (log/error "Could not publish message b/c"
                               (.getLocalizedMessage e))))))))

(defn- process-receive-topic [consumer chan]
  (async/go (while true
              (let [v (async/<! chan)
                    t (:topic v)
                    m (:message v)
                    f ((keyword t) @commands)]
                (if-not (or (nil? m) (nil? f))
                  (f m)
                  (log/debug "Nil value on Subscribe Channel"))))))

(defn publish-scmessage [kafka-comp message]
  (publish (:producer kafka-comp) message))

(defn publish-map [kafka-comp m]
  (publish (:producer kafka-comp) (scm/map->SCMessage {:payload m})))

(defrecord KafkaComponent [producer-config consumer-config]
  component/Lifecycle
  (start [this]
    (log/debug "Starting Kafka Component")
    (let [producer (construct-producer producer-config)
          consumer (construct-consumer consumer-config)
          rec-chan (async/chan)
          pub-chan (async/chan)]
      (process-receive-topic consumer rec-chan)
      (process-send-topic producer pub-chan)

      (assoc this :publish-channel pub-chan)))
  (stop [this]
    (log/debug "Stopping MQTT Component")
    (async/close! (:publish-channel this))
    (async/close! (:subscribe-channel this))
    (mh/disconnect (:producer this))
    this))

(defn make-kafka-component
  [producer-config consumer-config]
  (map->KafkaComponent {:producer-config producer-config
                        :consumer-config consumer-config}))
