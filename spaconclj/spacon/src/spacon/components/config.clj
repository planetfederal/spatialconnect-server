(ns spacon.components.config
  (:require [com.stuartsierra.component :as component]
            [spacon.util.protobuf :as pbf]
            [spacon.components.mqtt :as mqttcomponent]))

(defrecord ConfigComponent [mqtt]
  component/Lifecycle
  (start [this]
    (mqttcomponent/listenOnTopic mqtt "/config"
      (fn [_ _ ^bytes payload]
        (let [message (pbf/bytes->map payload)]
          (mqttcomponent/publishToTopic mqtt (:replyTo message) (pbf/map->protobuf (assoc message :payload "New Config"))))))
    this)
  (stop [this]
    this))

(defn make-config-component []
  (map->ConfigComponent {}))