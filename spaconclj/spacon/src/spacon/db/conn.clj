(ns spacon.db.conn
  (:require [yesql.core :refer [defqueries]]
            [ragtime.jdbc :as jdbc]
            [ragtime.repl :as repl]
            [com.stuartsierra.component :as component]))

(defn loadconfig []
  {:datastore (jdbc/sql-database
                {:connection-uri "jdbc:postgresql://localhost:5432/spacon?user=spacon&password=spacon"})
   :migrations (jdbc/load-resources "migrations")})

(defn migrate [] (repl/migrate (loadconfig)))

(defn rollback [] (repl/rollback (loadconfig)))