(ns spacon.models.devices
  (:require [spacon.db.conn :as db]))

(defqueries "sql/device.sql"
            {:connection db/db-spec})