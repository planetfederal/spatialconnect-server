(ns spacon.models.notification
  (:require [com.stuartsierra.component :as component]
            [spacon.db.conn :as db]))

(defqueries "notification.sql" db/db-spec)

(defn insert-notification [trigger-id]
  (insert-notification! {:trigger_id trigger-id}))

(defn notifications-list []
  (unsent-notifications-list))

(defn mark-as-sent [notif-id]
  (mark-as-sent! {:id notif-id}))