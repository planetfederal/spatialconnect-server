(ns spacon.components.notification.db
  (:require [com.stuartsierra.component :as component]
            [yesql.core :refer [defqueries]]
            [spacon.db.conn :as db]))

(defqueries "sql/notification.sql" {:connection db/db-spec})

(defn create
  "Adds a notification to the queue"
  [trigger-id]
  (insert-notification! {:trigger_id trigger-id}))

(defn all
  "List of all the unsent notifications"
  []
  (unsent-notifications-list))

(defn mark-as-sent [notif-id]
  (mark-as-sent! {:id notif-id}))
