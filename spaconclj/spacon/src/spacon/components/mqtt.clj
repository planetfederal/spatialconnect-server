(ns spacon.components.mqtt
  (:require [com.stuartsierra.component :as component]
            [clojurewerkz.machine-head.client :as mh]))

(def id "spacon-server")

(def broker-url (str "tcp://localhost:1883"))

(defn connectmqtt []
  (mh/connect broker-url id)] ()
    (mh/subscribe conn {"MQTTKitExample" 0}
                  (fn [^String topic _ ^bytes payload]
                    (println (String. payload "UTF-8"))
                    (mh/disconnect conn)
                    (System/exit 0)))
    (mh/publish conn "MQTTKitexample" "Child Please")))


(defrecord MqttComponent [mqtt-config]
  component/Lifecycle
  (start [this]
    (assoc this :conn (connectmqtt)))
  (stop [this]
    this))

(defn make-mqtt-component [mqtt-config]
  (map->MqttComponent {:mqtt-config mqtt-config}))