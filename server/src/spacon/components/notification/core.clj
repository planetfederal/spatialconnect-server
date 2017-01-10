(ns spacon.components.notification.core
  (:require [com.stuartsierra.component :as component]
            [spacon.components.mqtt.core :as mqttapi]
            [clojure.core.async :refer [chan <!! >!! close! go alt!]]
            [postal.core :refer [send-message]]
            [spacon.components.notification.db :as notifmodel]
            [spacon.http.intercept :as intercept]
            [spacon.http.response :as response]))

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
    (send->devices mqtt (:to message) message))
  (map notifmodel/mark-as-sent (:notif-id message)))

(def conn {:host (or (System/getenv "SMTP_HOST")
                     "email-smtp.us-east-1.amazonaws.com")
           :ssl  true
           :user (System/getenv "SMTP_USERNAME")
           :pass (System/getenv "SMTP_PASSWORD")})

(defn- build-notification-link
  [id]
  (let [hostname (or (System/getenv "HOSTNAME")
                     (.getHostName (java.net.InetAddress/getLocalHost)))]
    (str "http://" hostname "/notifications/" id)))

(defn- email-recipient
  [id recipient message]
  (let [body (str (:body message) "\n" (build-notification-link id))]
    (send-message conn {:from    "mobile@boundlessgeo.com"
                        :to      (str recipient)
                        :subject (str (:title message))
                        :body    body})))

(defn- send->email
  [message]
  (let [recipients (zipmap (:notif-ids message) (:to message))]
    (map (fn [[id recipient]]
           (email-recipient id recipient message)
           (notifmodel/mark-as-sent id))
         recipients)))

(defn- process-channel [mqtt input-channel]
  (go (while true
        (let [v (<!! input-channel)]
          (case (:output-type v)
            :email (send->email v)
            :mobile (send->mobile mqtt v)
            "default")))))

(defn notify [notifcomp message message-type info]
  (let [ids (map :id (notifmodel/create-notifications (:to message) message-type info))]
    (go (>!! (:send-channel notifcomp)
             (assoc message :notif-ids ids)))))

(defn http-get-notif [context]
  (let [id (Integer/parseInt (get-in context [:path-params :id]))]
    (response/ok (notifmodel/find-notif-by-id id))))

(defn routes []
  #{["/api/notifications/:id" :get (conj intercept/common-interceptors `http-get-notif)]})

(defrecord NotificationComponent [mqtt]
  component/Lifecycle
  (start [this]
    (let [c (chan)]
      (process-channel mqtt c)
      (assoc this :mqtt mqtt :send-channel c :routes (routes))))
  (stop [this]
    (close! (:send-channel this))
    this))

(defn make-notification-component []
  (->NotificationComponent nil))
