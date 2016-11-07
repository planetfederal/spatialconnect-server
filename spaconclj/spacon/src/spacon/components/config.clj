(ns spacon.components.config
  (:require [com.stuartsierra.component :as component]
            [spacon.components.mqtt :as mq]
            [spacon.util.protobuf :as pbf]
            [spacon.components.mqtt :as mqtt]))

(defrecord ConfigComponent [mqtt]
  component/Lifecycle
  (start [this]
    (mqtt/listenOnTopic mqtt "/config"
      (fn [_ _ ^bytes payload]
        (let [message (pbf/bytes->map payload)]
          (mqtt/publishToTopic mqtt (:replyTo message) (pbf/map->protobuf (assoc message :payload "New Config"))))))
    this)
  (stop [this]
    this))

(defn make-config-component []
  (map->ConfigComponent {}))