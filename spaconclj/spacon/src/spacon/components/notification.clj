(ns spacon.components.notification
  (:require [com.stuartsierra.component :as component]))

(defrecord NotificationComponent [mqtt]
  component/Lifecycle
  (start [this]
    this)
  (stop [this]
    this))

(defn make-notification-component []
  (->NotificationComponent nil))