(ns spacon.components.mqtt
  (:require [com.stuartsierra.component :as component]))

(defn sendmessage [mqtt channel message]
  (print channel)
  (print message))

(defrecord MqttComponent [mqtt-config]
  component/Lifecycle
  (start [this]
    (print "Starting MQTT")
    this)
  (stop [this]
    (print "Stopping MQTT")
    this))

(defn make-mqtt-component [mqtt-config]
  (map->MqttComponent {:mqtt-config mqtt-config}))