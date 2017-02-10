(ns spacon.components.notification.db
  (:require [com.stuartsierra.component :as component]
            [yesql.core :refer [defqueries]]
            [camel-snake-kebab.core :refer :all]
            [camel-snake-kebab.extras :refer [transform-keys]]
            [spacon.db.conn :as db]
            [clojure.data.json :as json]))

;; define sql queries as functions in this namespace
(defqueries "sql/notification.sql" {:connection db/db-spec})

(defn sanitize-notif [n]
  (transform-keys ->kebab-case-keyword
                  (dissoc n :updated_at :deleted_at)))

(defn sanitize-message [m]
  (transform-keys ->kebab-case-keyword m))

(defn- create-message [message-type info]
  (sanitize-message
   (insert-message<!
    {:type message-type :info (json/write-str info)})))

(defn find-message-by-id [id]
  (find-message-by-id-query {:id id}))

(defn create-notifications
  "Adds a notification to the queue"
  [recipients message-type info]
  (let [message (create-message message-type info)
        id (:id message)]
    (map #(sanitize-notif
           (insert-notification<!
            {:recipient  %
             :message_id id})) recipients)))

(defn create-notification
  [recipient message-type info]
  (sanitize-notif
   (insert-notification<!
    {:recipient  recipient
     :message_id (:id (create-message message-type info))})))

(defn unsent
  "List of all the unsent notifications"
  []
  (map sanitize-notif (unsent-notifications-list)))

(defn undelivered
  []
  (map sanitize-notif (undelivered-notifications-list)))

(defn find-notif-by-id [id]
  (some-> (find-notification-by-id-query {:id id})
          first
          sanitize-notif))

(defn find-message-by-id [id]
  (some-> (find-message-by-id-query {:id id})
          first
          sanitize-message))

(defn mark-as-sent [notif-id]
  (mark-as-sent! {:id notif-id}))

(defn mark-as-delivered [notif-id]
  (mark-as-delivered! {:id notif-id}))

