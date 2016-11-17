(ns spacon.components.email
  (:require [com.stuartsierra.component :as component]))

(defrecord EmailComponent [smtp-config]
  component/Lifecycle
  (start [this]
    this)
  (stop [this]
    this))
