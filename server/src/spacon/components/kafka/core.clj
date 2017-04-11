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

(ns spacon.components.kafka.core
  (:require [com.stuartsierra.component :as component]
            [clojure.core.async :as async]
            [clojure.walk :refer [keywordize-keys]]
            [spacon.components.http.auth :refer [get-token]]
            [clojure.tools.logging :as log]
            [spacon.specs.connectmessage]
            [clojure.data.json :as json]
            [clojure.spec :as s])
  (:import [org.apache.kafka.clients.producer ProducerRecord KafkaProducer Callback
                                              RecordMetadata Producer]
           [org.apache.kafka.clients.consumer Consumer ConsumerConfig KafkaConsumer]
           [org.apache.kafka.common.serialization Serializer StringSerializer
                                                  Deserializer StringDeserializer]))

(def client-id "spacon-server")
(def spacon-topic "spacon")
(def spacon-replyto-topic "spacon_replyto")

(def actions
  "Map of topics as keys and message handler functions as values"
  (ref {}))

(defn- add-action
  "Transactionally adds topic to topics ref"
  [cmd fn]
  (log/trace "Adding command " cmd)
  (dosync
    (commute actions assoc (keyword cmd) fn)))

(defn- remove-action
  "Transactionally removes command from commands ref"
  [cmd]
  (log/trace "Removing command " cmd)
  (dosync
    (commute actions dissoc (keyword cmd))))

;; todo: write specs for valid records that we accept
;; for instance, restrict the topics and keys that can be sent
;; keys should be time-based uuids? --> use [danlentz/clj-uuid "0.1.7"]
(defn- producer-record
  "Constructs a ProducerRecord from a map"
  [record]
  (let [value (json/write-str record)
        topic spacon-replyto-topic]
    (ProducerRecord. topic value)))

(defn- send!
  "Sends a record (a map of :topic, :value and optionally :key, :partition) using
  the given Producer component. Returns ch (a promise-chan unless otherwise specified)
  where record metadata will be put after it's successfuly sent."
  ([kafka-comp record]
   (send! kafka-comp record (async/promise-chan)))
  ([kafka-comp record ch]
   (let [^Producer producer (:producer kafka-comp)]
     (.send producer
            (producer-record record)
            (reify
              Callback
              (^void onCompletion [_ ^RecordMetadata rm ^Exception e]
                (let [ret (when rm
                            {:offset    (.offset rm)
                             :partition (.partition rm)
                             :topic     spacon-replyto-topic
                             :timestamp (.timestamp rm)})]
                  (async/put! ch (or ret e))))))
     ch)))

(defn- record->map
  "This takes a kafka ConsumerRecord from LYRS and returns
  a map representation"
  [r]
  (try
    (let [data (-> (.value r) json/read-str keywordize-keys :data)]
      (assoc data :payload (if (empty? (:payload data))
                             {}
                             (-> (:payload data) json/read-str keywordize-keys))))
  (catch Exception e
    (log/error e)
    nil)))

(defn- map->record
  "This takes a SC message and prepares it for transmission
  to LYRS "
  [m]
  (json/write-str m))

(defn- listen
  [^Consumer consumer output-chan topic]
  (do
    (.subscribe consumer #{topic})
    (async/go-loop []
      (if-let [crecords (.poll consumer 1000)]
        (if-not (.isEmpty crecords)
          (let [records (.iterator crecords)]
            (loop [record (.next records)]
              (if-let [r (record->map record)]
                (if (s/valid? :spacon.specs.connectmessage/connect-message r)
                  (async/put! output-chan r)
                  (log/error (s/explain :spacon.specs.connectmessage/connect-message r))))
              (if (.hasNext records)
                (recur (.next records))))))
        (.commitSync consumer))
      (recur))))

(defn subscribe
  "Subscribe to kafka topic with message handler function f"
  [kafka-comp cmd f]
  (log/debug "Subscribing to command " cmd)
  (add-action cmd f))

(defn unsubscribe
  "Unsubscribe to kafka topic"
  [kafka cmd]
  (log/debug "Unsubscribing to command" cmd)
  (remove-action cmd))

(defn- construct-producer
  "Construct and return a KafkaProducer using the producer-config map
  (See https://kafka.apache.org/documentation.html#producerconfigs
  for more details about the config)"
  [producer-config]
  (let [{:keys [servers timeout-ms client-id config key-serializer value-serializer]
         :or   {config           {}
                key-serializer   (StringSerializer.)
                value-serializer (StringSerializer.)
                client-id        (str "sc-producer-"
                                      (.getHostName (java.net.InetAddress/getLocalHost)))}}
        producer-config]
    (KafkaProducer. ^java.util.Map
                    (assoc config
                      "request.timeout.ms" (str timeout-ms)
                      "bootstrap.servers" servers
                      "client.id" client-id
                      "acks" "all")
                    ^Serializer key-serializer
                    ^Serializer value-serializer)))

(defn- construct-consumer
  [consumer-config]
  (let [{:keys [servers client-id key-deserializer value-deserializer]
         :or   {client-id          (str "sc-consumer-"
                                        (.getHostName (java.net.InetAddress/getLocalHost)))
                servers            "localhost:9092"
                key-deserializer   (StringDeserializer.)
                value-deserializer (StringDeserializer.)}} consumer-config]
    (KafkaConsumer. ^java.util.Map
                    (assoc {}
                      ConsumerConfig/CLIENT_ID_CONFIG client-id
                      ConsumerConfig/GROUP_ID_CONFIG client-id
                      ConsumerConfig/BOOTSTRAP_SERVERS_CONFIG servers)
                    ^Deserializer key-deserializer
                    ^Deserializer value-deserializer)))

(defn- process-receive-topic
  "This will take the incoming commands and execute the value against the
  function in the commands ref"
  [chan]
  (async/go-loop []
    (let [connect-message (async/<! chan)]
      (if-let [func ((keyword (:action connect-message)) @actions)]
        (func connect-message)
        (log/debug "function not present for " (:action connect-message))))
    (recur)))

;; PUBLIC COMPONENT API
(defn publish [kafka-comp m]
  (send! kafka-comp m))

(defn publish-map [kafka-comp m]
  (publish kafka-comp m))

(defrecord KafkaComponent [producer-config consumer-config]
  component/Lifecycle
  (start [this]
    (log/debug "Starting Kafka Component")
    (let [consumer (construct-consumer consumer-config)
          producer (construct-producer producer-config)
          rec-chan (async/chan)]
      (process-receive-topic rec-chan)
      (listen consumer rec-chan spacon-topic)
      (log/debug "Kafka Component Started")
      (assoc this :subscribe-channel rec-chan
                  :producer producer :consumer consumer)))
  (stop [this]
    (log/debug "Stopping Kafka Component")
    (async/close! (:publish-channel this))
    (async/close! (:subscribe-channel this))
    ((:publish-channel))
    this))

(defn make-kafka-component
  [producer-config consumer-config]
  (map->KafkaComponent {:producer-config producer-config
                        :consumer-config consumer-config}))
