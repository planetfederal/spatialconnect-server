(ns spacon.models.notification
  (:require [com.stuartsierra.component :as component]
            [yesql.core :refer [defqueries]]
            [spacon.db.conn :as db]))

(defqueries "sql/notification.sql" {:connection db/db-spec})

(defn insert-notification [trigger-id]
  (insert-notification! {:trigger_id trigger-id}))

(defn notifications-list []
  (unsent-notifications-list))

(defn mark-as-sent [notif-id]
  (mark-as-sent! {:id notif-id}))