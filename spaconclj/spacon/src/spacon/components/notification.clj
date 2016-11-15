(ns spacon.components.notification
  (:require [com.stuartsierra.component :as component]
            [spacon.components.mqtt :as mq]))

(defn send->device [notifcomp device-id message]
  (mq/publishToTopic (:mqtt notifcomp) (str "/notify/" device-id) message))

(defn send->devices [notifcomp devices message]
  (map (fn [device-id]
         (send->device notifcomp device-id message)) devices))

(defn send->all [notifcomp message]
  (mq/publishToTopic (:mqtt notifcomp) "/notify" message))

(defrecord NotificationComponent [mqtt]
  component/Lifecycle
  (start [this]
    (assoc this :mqtt mqtt))
  (stop [this]
    this))

(defn make-notification-component []
  (->NotificationComponent nil))