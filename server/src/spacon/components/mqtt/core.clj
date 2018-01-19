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
            [spacon.entity.msg :as msg]
            [spacon.components.http.intercept :as intercept]
            [spacon.components.http.response :as response]
            [spacon.components.http.auth :refer [get-token]]
            [clojure.tools.logging :as log]
            [spacon.components.queue.protocol :as queue]
            [clojure.core.async :as async])
  (:import (org.eclipse.paho.client.mqttv3 MqttException)
           (java.net InetAddress)))

(def client-id (or (System/getenv "MQTT_CLIENT_ID")
                   (subs (str "sc-" (InetAddress/getLocalHost)) 0 22)))
(defonce conn (atom nil))
(def action-topic {:register-device "/config/register"
                   :full-config "/config"
                   :config-update "/config/update"
                   :store-form "/store/form"
                   :ping "/ping"
                   :device-info "/device/info"
                   :location-tracking "/store/tracking"})

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
  (while (or (nil? @conn) (not (mh/connected? @conn)))
    (log/debugf "Connecting MQTT Client to %s" url)
    (try
      (do
        (reset! conn (mh/connect url client-id))
        (log/infof "MQTT Client connected to %s" url))
      (catch MqttException e
        (do
          (log/error e "Failed to connect to" url)
          ; wait 4 seconds befor trying again
          (Thread/sleep 4000))))))

; receive message on subscribe channel
(defn- receive [_ topic message]
  (if-let [msg (msg/from-bytes message)]
    (do
      (log/debugf "Received message on topic: %nmessage: %s" topic (msg/from-bytes msg))
      (let [func ((keyword topic) @topics)]
        (func msg)))
    (log/error "Received invalid protobuf from mqtt on topic:" topic)))

(defn- subscribe-mqtt
  "Subscribe to mqtt topic with message handler function f"
  ([mqtt-comp broker-url disconnect-reason]
   (log/error "Disconnect from " broker-url (.getLocalizedMessage disconnect-reason))
   (subscribe-mqtt mqtt-comp))
  ([mqtt-comp topic]
   (if (or (nil? @conn) (not (mh/connected? @conn)))
     (do (connectmqtt (:broker-url mqtt-comp))))
   (log/debugf "Subscribing to topic %s" topic)
   (mh/subscribe @conn {topic 2}
                 (fn [^String topic _ ^bytes payload]
                   (async/go (receive mqtt-comp topic payload)))
                 {:on-connection-lost (partial subscribe-mqtt mqtt-comp (:broker-url mqtt-comp))}))
  ([mqtt-comp]
   (doall (map (fn [topic-key]
                 (let [topic (subs (str topic-key) 1)]
                   (subscribe-mqtt mqtt-comp topic)))
               (keys @topics)))))

(defn subscribe [mqtt-comp topic func]
  (add-topic topic func)
  (subscribe-mqtt mqtt-comp topic))

(defn unsubscribe
  "Unsubscribe to mqtt topic"
  [_ topic]
  (log/debug "Unsubscribing to topic" topic)
  (remove-topic topic)
  (mh/unsubscribe @conn topic))

; publishes message on the send channel
(defn- publish [_ topic message]
  (log/debugf "Publishing to topic %s %nmessage: %s" topic message)
  (prn message)
  (try
    (mh/publish @conn topic (msg/message->bytes message))
    (catch Exception e
      (log/error "Could not publish b/c" (.getLocalizedMessage e)))))

(defn publish-scmessage [mqtt-comp topic message]
  (publish mqtt-comp topic message))

(defn publish-map [mqtt-comp topic m]
  (publish mqtt-comp topic (msg/map->Msg {:payload m})))

(defrecord MqttComponent [mqtt-config]
  component/Lifecycle
  queue/IQueue
  (start [this]
    (log/debug "Starting MQTT Component")
    (let [url (or (:broker-url mqtt-config) "tcp://localhost:1883")
          m (connectmqtt url)]
      (assoc this :conn m :broker-url url)))
  (stop [this]
    (log/debug "Stopping MQTT Component")
    (mh/disconnect @conn)
    this)
  (publish [this msg]
    (let [topic (or (get action-topic (:to msg)) (:to msg))]
      (publish this topic (assoc-in msg [:to] topic))))
  (subscribe [this action f]
    (subscribe this (get action-topic action) f))
  (unsubscribe [this action]
    (unsubscribe this action)))

(defn make-mqtt-component [mqtt-config]
  (map->MqttComponent {:mqtt-config mqtt-config}))
