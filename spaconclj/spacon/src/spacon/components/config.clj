(ns spacon.components.config
  (:require [com.stuartsierra.component :as component]))

(defrecord ConfigComponent []
  component/Lifecycle
  (start [this]
    this)
  (stop [this]
    this))

(defn make-config-component []
  (->ConfigComponent))