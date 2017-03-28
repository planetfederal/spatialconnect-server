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
            [clojure.core.async.impl.protocols :as p]
            [clojure.tools.logging :as log])
  (:import [org.apache.kafka.clients.producer Producer KafkaProducer ProducerRecord Callback RecordMetadata]
           [org.apache.kafka.clients.consumer Consumer ConsumerConfig KafkaConsumer]
           [org.apache.kafka.common.serialization Serializer StringSerializer Deserializer StringDeserializer]))



(defrecord KafkaComponent [producer-config consumer-config]
  component/Lifecycle
  (start [this]
    (log/debug "Starting ProducerComponent")
    (assoc this :producer (construct-producer producer-config) :consumer (construct-consumer consumer-config)))
  (stop [this]
    (log/debug "Stopping ProducerComponent")
    (.close (:producer this))
    this))

(defn make-kafka-component
  [producer-config consumer-config]
  (map->KafkaComponent {:producer-config producer-config
                        :consumer-config consumer-config}))

;; todo: write specs for valid records that we accept
;; for instance, restrict the topics and keys that can be sent
;; keys should be time-based uuids? --> use [danlentz/clj-uuid "0.1.7"]
(defn- producer-record
  "Constructs a ProducerRecord from a map"
  [record]
  (let [{:keys [topic partition key value]} record]
    (cond
      (and partition key) (ProducerRecord. topic (int partition) key value)
      key (ProducerRecord. topic key value)
      :else (ProducerRecord. topic value))))

(defn send!
  "Sends a record (a map of :topic, :value and optionally :key, :partition) using the given Producer component.
  Returns ch (a promise-chan unless otherwise specified) where record metadata will be put after it's successfuly sent."
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
                             :topic     (.topic rm)
                             :timestamp (.timestamp rm)})]
                  (async/put! ch (or ret e))))))
     ch)))

(defn listen
  ([kafka-comp topic f]
   (let [^Consumer consumer (:consumer kafka-comp)]
     (.subscribe consumer #{topic})
     (while true
       (-> (.poll consumer 100) f))
     )))
