(ns spacon.components.mqtt
  (:require [com.stuartsierra.component :as component]
            [clojurewerkz.machine-head.client :as mh])
  (:import
    (com.boundlessgeo.spatialconnect.schema SCMessageOuterClass$SCMessage SCCommand SCMessageOuterClass)))

(def id "spacon-server")

(def broker-url (str "tcp://localhost:1883"))

(defn- connectmqtt []
  (mh/connect broker-url id))

(defn publish [mqtt topic message]
  ; mqtt component
  ; topic to publish to
  ; message is a protobuf obj
  (mh/publish (:conn mqtt) topic (.toByteArray message)))

(defn subscribe [mqtt topic f]
  (mh/subscribe (:conn mqtt) {topic 0} (fn [^String topic _ ^bytes payload]
                                         (f  ))))

(defn listenOnTopic [mqtt topic f]
  (subscribe mqtt topic f))

(defrecord MqttComponent [mqtt-config]
  component/Lifecycle
  (start [this]
    (assoc this :conn (connectmqtt)))
  (stop [this]
    (mh/disconnect (:conn this))
    this))

(defn make-mqtt-component [mqtt-config]
  (map->MqttComponent {:mqtt-config mqtt-config}))