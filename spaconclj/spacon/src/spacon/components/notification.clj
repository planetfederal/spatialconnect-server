(ns spacon.components.notification
  (:require [com.stuartsierra.component :as component]
            [spacon.components.mqtt :as mq]
            [clojure.core.async :refer [chan <!! >!! close! go alt!]]))

(defn- send->device [mqtt device-id message]
  (mq/publishMapToTopic mqtt (str "/notify/" device-id) message))

(defn- send->devices [mqtt devices message]
  (map (fn [device-id]
         (send->device mqtt device-id message)) devices))

(defn- send->all [mqtt message]
  (mq/publishMapToTopic mqtt "/notify" message))

(defn- send->mobile [mqtt message]
  (case (count (:to message))
    0 (send->all mqtt message)
    1 (send->device mqtt (first (:to message)) message)
    (send->devices mqtt (:to message) message)))

(defn- send->email []
  (println "Sending Email...TODO"))

(defn- process-channel [mqtt input-channel]
  (go (while true
        (let [v (<!! input-channel)]
          (case (:type v)
            :email (send->email)
            :mobile (send->mobile mqtt v))))))

(defn send->notification [notifcomp message]
  (go (>!! (:send-channel notifcomp) message)))

(defrecord NotificationComponent [mqtt]
  component/Lifecycle
  (start [this]
    (let [c (chan)]
      (process-channel mqtt c)
      (assoc this :mqtt mqtt :send-channel c)))
  (stop [this]
    (close! (:send-channel this))
    this))

(defn make-notification-component []
  (->NotificationComponent nil))