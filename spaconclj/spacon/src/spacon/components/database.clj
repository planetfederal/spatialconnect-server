(ns spacon.components.database
  (:require [com.stuartsierra/component :as component]))

(defrecord Database []
  component/Lifecycle
  (start [component]
    component)
  (stop [component]
    component))
