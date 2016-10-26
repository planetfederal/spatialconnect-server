(ns spacon.components.config
  (:require [com.stuartsierra.component :as component]))

(defrecord Config []
  component/Lifecycle
  (start [this]
    this)
  (stop [this]
    this))
