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
            [spacon.http.intercept :as intercept]
            [spacon.http.response :as response]
            [clojure.core.async :as async]
            [spacon.http.auth :refer [get-token]]
            [clojure.tools.logging :as log]))

(def client-id "spacon-server")

(def topics
  "Map of topics as keys and message handler functions as values"
  (ref {}))

(defn- add-topic
  "Transactionally adds topic to topics ref"
  [topic fn]
  (log/trace "Adding topic" topic)
  (dosync
   (commute topics assoc (keyword topic) fn)))

(defn- remove-topic
  "Transactionally removes topic from topics ref"
  [topic]
  (log/trace "Removing topic" topic)
  (dosync
   (commute topics dissoc (keyword topic))))

(defn connectmqtt
  "Connect to mqtt broker at url
   Example url: ssl://broker.hostname.domain:port"
  [url]
  (log/debug "Connecting MQTT Client at" url)
  (mh/connect url client-id))

; publishes message on the send channel
(defn- publish [mqtt topic message]
  (log/tracef "Publishing to topic %s %nmessage: %s" topic message)
  (async/go (async/>!! (:publish-channel mqtt) {:topic topic :message (scm/message->bytes message)})))

; receive message on subscribe channel
(defn- receive [mqtt topic message]
  (log/tracef "Received message on topic %s %nmessage:%s" topic message)
  (async/go (async/>!! (:subscribe-channel mqtt) {:topic topic :message (scm/from-bytes message)})))

(defn subscribe
  "Subscribe to mqtt topic with message handler function f"
  [mqtt topic f]
  (log/debug "Subscribing to topic" topic)
  (add-topic topic f)
  (mh/subscribe (:conn mqtt) {topic 2} (fn [^String topic _ ^bytes payload]
                                         (receive mqtt topic payload))))

(defn unsubscribe
  "Unsubscribe to mqtt topic"
  [mqtt topic]
  (log/debug "Unsubscribing to topic" topic)
  (remove-topic topic)
  (mh/unsubscribe (:conn mqtt) topic))

(defn- process-publish-channel [mqtt chan]
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

(defn- process-subscribe-channel [chan]
  (async/go (while true
              (let [v (async/<! chan)
                    t (:topic v)
                    m (:message v)
                    f ((keyword t) @topics)]
                (f m)))))

(defn publish-scmessage [mqtt topic message]
  (publish mqtt topic message))

(defn publish-map [mqtt topic m]
  (publish mqtt topic (scm/map->SCMessage {:payload m})))

(defn http-mq-post [mqtt context]
  (let [m (:json-params context)]
    (publish-map mqtt (:topic m) (:payload m)))
  (response/ok "success"))

(defn- routes [mqtt] #{["/api/mqtt" :post
                        (conj intercept/common-interceptors (partial http-mq-post mqtt)) :route-name :http-mq-post]})

(defrecord MqttComponent [mqtt-config]
  component/Lifecycle
  (start [this]
    (log/debug "Starting MQTT Component")
    (let [url (or (:broker-url mqtt-config) "tcp://localhost:1883")
          m (connectmqtt url)
          pub-chan (async/chan)
          sub-chan (async/chan)
          c (assoc this :conn m :publish-channel pub-chan :subscribe-channel sub-chan)]
      (process-publish-channel c pub-chan)
      (process-subscribe-channel sub-chan)
      (assoc c :routes (routes c))))
  (stop [this]
    (log/debug "Stopping MQTT Component")
    (async/close! (:publish-channel this))
    (async/close! (:subscribe-channel this))
    (mh/disconnect (:conn this))
    this))

(defn make-mqtt-component [mqtt-config]
  (map->MqttComponent {:mqtt-config mqtt-config}))
