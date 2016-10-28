(ns spacon.components.config
  (:require [com.stuartsierra.component :as component]))

(defrecord ConfigComponent []
  component/Lifecycle
  (start [this]
    (println "Starting Config")
    this)
  (stop [this]
    (println "Stopping Config")
    this))

(defn make-config-component []
  (->ConfigComponent))