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
            [clojure.core.async :as async]
            [spacon.components.http.auth :refer [get-token]]
            [clojure.tools.logging :as log]
            [spacon.components.queue.protocol :as queue]
            [clojure.data.json :as json])
  (:import (org.eclipse.paho.client.mqttv3 MqttException)
           (java.net InetAddress)))

(def vcap_mqtt
  "Map of keys and values from VCAP_SERVICES mqtt environment variable"
  (or (some-> (System/getenv "VCAP_SERVICES")
              (json/read-str :key-fn clojure.core/keyword) :p-rabbitmq first :credentials :protocols :mqtt)
                {:username :username
                 :password :password
                 :host :host
                 :port :port
                 :ssl :ssl}))

(def mqtt-connect-ops
  "Map of authentication keys and values for mqtt connect options"
  {:username (or (System/getenv "MQTT_USERNAME") (:username vcap_mqtt))
   :password (or (System/getenv "MQTT_PASSWORD") (:password vcap_mqtt))})

(def vcap_tcp
  "When vcap_mqtt exists it returns a formated tcp connection"
  (when (some? vcap_mqtt)
        (format "%s://%s:%s" (if (:ssl vcap_mqtt) "ssl" "tcp") (:host vcap_mqtt) (:port vcap_mqtt))))

(def client-id (or (System/getenv "MQTT_CLIENT_ID")
                   (subs (str "sc-" (InetAddress/getLocalHost)) 0 22 )))
(defonce conn (atom nil))
(def action-topic {:register-device "/config/register"
                     :full-config "/config"
                     :config-update "/config/update"
                     :store-form "/store/form"
                     :ping "/ping"
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
        (reset! conn (mh/connect url client-id mqtt-connect-ops))
        (log/infof "MQTT Client connected to %s" url))
      (catch MqttException e
        (do
          (log/error e "Failed to connect to" url)
          ; wait 4 seconds befor trying again
          (Thread/sleep 4000))))))

; publishes message on the send channel
(defn- publish [mqtt topic message]
  (log/debugf "Publishing to topic %s %nmessage: %s" topic message)
  (prn message)
  (async/go (async/>!! (:publish-channel mqtt) {:topic topic :message (msg/message->bytes message)})))

; receive message on subscribe channel
(defn- receive [mqtt topic message]
  (log/debugf "Received message on topic: %nmessage: %s" topic (msg/from-bytes message))
  (prn (msg/from-bytes message))
  (if (nil? message)
    (log/debugf "Nil message on topic " topic)
    (async/go (async/>!! (:subscribe-channel mqtt) {:topic topic :message (msg/from-bytes message)}))))

(defn reconnect [mqtt-comp reason ]
  (let [url (or (System/getenv "MQTT_BROKER_URL") vcap_tcp "tcp://localhost:1883")]
    (log/debugf "Connection lost (%s). Attempting reconnect to %s" reason url)
    (connectmqtt url)
    (doall (map (fn [t]
                  (mh/subscribe @conn {(subs (str t) 1) 2}
                                (fn [^String topic _ ^bytes payload]
                                  (receive mqtt-comp topic payload))
                                {:on-connection-lost (partial reconnect mqtt-comp) }))
                (keys @topics)))))

(defn subscribe
  "Subscribe to mqtt topic with message handler function f"
  [mqtt topic f]
  (log/debug "Subscribing to topic" topic)
  (add-topic topic f)
  (mh/subscribe @conn {topic 2}
                (fn [^String topic _ ^bytes payload]
                  (receive mqtt topic payload))
                {:on-connection-lost (partial reconnect mqtt) }))

(defn unsubscribe
  "Unsubscribe to mqtt topic"
  [mqtt topic]
  (log/debug "Unsubscribing to topic" topic)
  (remove-topic topic)
  (mh/unsubscribe @conn topic))

(defn- process-publish-channel [mqtt chan]
  (async/go (while true
              (let [v (async/<!! chan)
                    t (:topic v)
                    m (:message v)]
                (try
                  (if-not (mh/connected? @conn)
                    (do
                      (reconnect mqtt nil)
                      (if-not (or (nil? t) (nil? m))
                        (mh/publish @conn t m)))
                    (if-not (or (nil? t) (nil? m))
                      (mh/publish @conn t m)))
                  (catch Exception e
                    (log/error "Could not publish message b/c"
                               (.getLocalizedMessage e))))))))

(defn- process-subscribe-channel [chan]
  (async/go (while true
              (let [v (async/<! chan)
                    t (:topic v)
                    m (:message v)
                    f ((keyword t) @topics)]
                (log/debugf "inside let process-subscribe-channel")
                (log/debugf t)
                (if-not (or (nil? m) (nil? f))
                  (f m)
                  (log/debugf "Nil value on Subscribe Channel"))))))

(defn publish-scmessage [mqtt topic message]
  (publish mqtt topic message))

(defn publish-map [mqtt topic m]
  (publish mqtt topic (msg/map->Msg {:payload m})))

(defrecord MqttComponent [mqtt-config]
  component/Lifecycle
  queue/IQueue
  (start [this]
    (log/debug "Starting MQTT Component")
    (let [url (or (:broker-url mqtt-config) vcap_tcp "tcp://localhost:1883")
          m (connectmqtt url)
          pub-chan (async/chan)
          sub-chan (async/chan)
          c (assoc this :conn m :publish-channel pub-chan :subscribe-channel sub-chan)]
      (process-publish-channel c pub-chan)
      (process-subscribe-channel sub-chan)
      c))
  (stop [this]
    (log/debug "Stopping MQTT Component")
    (async/close! (:publish-channel this))
    (async/close! (:subscribe-channel this))
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
