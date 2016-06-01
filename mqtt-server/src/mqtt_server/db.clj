(ns mqtt-server.db
  (:require [yesql.core :refer [defqueries]]
            [ragtime.jdbc :as jdbc]
            [ragtime.repl :as repl]
            [environ.core :refer [env]]))

(def database-url (str (env :database-host) ":" (env :database-port) "/" (env :database-name)))

(def db-spec {:classname "org.postgresql.Driver"
              :subprotocol "postgresql"
              :subname (str "//" database-url)
              :user (env :database-username)
              :password (env :database-password)})

(defn loadconfig []
  {:datastore (jdbc/sql-database
                {:connection-uri (str "jdbc:postgresql://" database-url
                                      "?user=" (env :database-username)
                                      "&password=" (env :database-password))})
   :migrations (jdbc/load-resources "migrations")})

(defn migrate [] (repl/migrate (loadconfig)))

(defn rollback [] (repl/rollback (loadconfig)))
