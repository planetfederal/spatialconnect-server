(ns spacon.components.notification
  (:require [com.stuartsierra.component :as component]
            [spacon.components.mqtt :as mqttapi]
            [clojure.core.async :refer [chan <!! >!! close! go alt!]]
            [postal.core :refer [send-message]]))

(defn- send->device [mqtt device-id message]
  (mqttapi/publish-map mqtt (str "/notify/" device-id) message))

(defn- send->devices [mqtt devices message]
  (map (fn [device-id]
         (send->device mqtt device-id message)) devices))

(defn- send->all [mqtt message]
  (mqttapi/publish-map mqtt "/notify" message))

(defn- send->mobile [mqtt message]
  (case (count (:to message))
    0 (send->all mqtt message)
    1 (send->device mqtt (first (:to message)) message)
    (send->devices mqtt (:to message) message)))

(def conn {:host (or (System/getenv "SMTP_HOST")
                     "email-smtp.us-east-1.amazonaws.com")
           :ssl  true
           :user (System/getenv "SMTP_USERNAME")
           :pass (System/getenv "SMTP_PASSWORD")})

(defn- send->email
  [message]
  (send-message conn {:from    "mobile@boundlessgeo.com"
                      :to      (:to message)
                      :subject (:title message)
                      :body    (:body message)}))

(defn- process-channel [mqtt input-channel]
  (go (while true
        (let [v (<!! input-channel)]
          (case (:output-type v)
            :email (send->email v)
            :mobile (send->mobile mqtt v)
            "default")))))

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
