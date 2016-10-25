(ns spacon.db.conn
  (:require [yesql.core :refer [defqueries]]
            [ragtime.jdbc :as jdbc]
            [ragtime.repl :as repl]))

(def db-spec {:classname "org.postgresql.Driver"
              :subprotocol "postgresql"
              :subname "//localhost:5432/spacon"
              :user "spacon"
              :password "spacon"})

(defn loadconfig []
  {:datastore (jdbc/sql-database
                {:connection-uri "jdbc:postgresql://localhost:5432/spacon?user=spacon&password=spacon"})
   :migrations (jdbc/load-resources "migrations")})

(defrecord Database [host port db user pass]
  )

(defn migrate [] (repl/migrate (loadconfig)))

(defn rollback [] (repl/rollback (loadconfig)))