(ns spacon.components.mqtt
  (:require [com.stuartsierra.component :as component]
            [clojurewerkz.machine-head.client :as mh]))

(def id "spacon-server")

(def broker-url (str "tcp://localhost:1883"))

(defn- parseProto [proto]
  (identity proto))

(defn- connectmqtt []
  (mh/connect broker-url id))

(defn publish [mqtt topic message]
  (mh/publish (:conn mqtt) topic message))

(defn subscribe [mqtt topic f]
  (mh/subscribe (:conn mqtt) {topic 0} f))

(defrecord MqttComponent [mqtt-config]
  component/Lifecycle
  (start [this]
    (assoc this :conn (connectmqtt)))
  (stop [this]
    (mh/disconnect (:conn this))
    this))

(defn make-mqtt-component [mqtt-config]
  (map->MqttComponent {:mqtt-config mqtt-config}))