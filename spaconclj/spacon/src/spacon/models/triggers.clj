(ns spacon.models.triggers
  (:require [spacon.db.conn :as db]))

(defqueries "sql/trigger.sql"
            {:connection db/db-spec})

