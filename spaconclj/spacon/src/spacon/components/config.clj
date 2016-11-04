(ns spacon.components.config
  (:require [com.stuartsierra.component :as component]
            [spacon.components.mqtt :as mqtt]))

(defrecord ConfigComponent [mqtt]
  component/Lifecycle
  (start [this]
    (spacon.components.mqtt/subscribe mqtt "/config"
                                      (fn [^String topic _ ^bytes payload]
                                        (String. payload "UTF-8")))
    this)
  (stop [this]
    this))

(defn make-config-component []
  (map->ConfigComponent {}))