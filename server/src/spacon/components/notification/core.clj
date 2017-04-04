;; Copyright 2016-2017 Boundless, http://boundlessgeo.com
;;
;; Licensed under the Apache License, Version 2.0 (the "License");
;; you may not use this file except in compliance with the License.
;; You may obtain a copy of the License at
;;
;; http://www.apache.org/licenses/LICENSE-2.0
;;
;; Unless required by applicable law or agreed to in writing, software
;; distributed under the License is distributed on an "AS IS" BASIS,
;; WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
;; See the License for the specific language governing permissions and
;; limitations under the License.

(ns spacon.components.notification.core
  (:require [com.stuartsierra.component :as component]
            [spacon.components.kafka.core :as kafkaapi]
            [clojure.core.async :refer [chan <!! >!! close! go alt!]]
            [postal.core :refer [send-message]]
            [spacon.components.notification.db :as notifmodel]
            [clojure.tools.logging :as log]))

(defn- send->device [kafka device-id message]
  (kafkaapi/publish-map kafka (str "/notify/" device-id) message))

(defn- send->devices [kafka devices message]
  (map (fn [device-id]
         (send->device kafka device-id message)) devices))

(defn- send->all [kafka message]
  (kafkaapi/publish-map kafka "/notify" message))

(defn- send->mobile [kafka message]
  (case (count (:to message))
    0 (send->all kafka message)
    1 (send->device kafka (first (:to message)) message)
    (send->devices kafka (:to message) message))
  (map notifmodel/mark-as-sent (:notif_id message)))

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
  (let [body (str (build-notification-link id))]
    (send-message conn {:from    "mobile@boundlessgeo.com"
                        :to      (str recipient)
                        :subject (str (:title message))
                        :body    body})))

(defn- send->email
  [message]
  (let [recipients (do (zipmap (:notif-ids message) (:to message)))]
    (doall (map (fn [[id recipient]]
                  (email-recipient id recipient message)
                  (notifmodel/mark-as-sent id))
                recipients))))

(defn- process-channel [kafka input-channel]
  (go (while true
        (let [v (<!! input-channel)]
          (case (:output_type v)
            :email (send->email v)
            :mobile (if-not (empty? kafka) (send->mobile kafka v)) ; For Signal that doesn't have an kafka component
            "default")))))

(defn notify [notifcomp message message-type info]
  (let [ids (map :id (notifmodel/create-notifications (:to message) message-type info))]
    (go (>!! (:send-channel notifcomp)
             (assoc message :notif-ids ids)))))

(defn find-notif-by-id
  [notif-comp id]
  (notifmodel/find-notif-by-id id))

(defrecord NotificationComponent [kafka]
  component/Lifecycle
  (start [this]
    (log/debug "Starting Notification Component")
    (let [c (chan)]
      (process-channel kafka c)
      (assoc this :kafka kafka :send-channel c)))
  (stop [this]
    (log/debug "Stopping Notification Component")
    (close! (:send-channel this))
    this))

(defrecord SignalNotificationComponent []
  component/Lifecycle
  (start [this]
    (log/debug "Starting Signal")
    (let [c (chan)]
      (process-channel nil c)
      (assoc this :send-channel c)))
  (stop [this]
    this))

(defn make-notification-component []
  (->NotificationComponent nil))

(defn make-signal-notification-component []
  (->SignalNotificationComponent))