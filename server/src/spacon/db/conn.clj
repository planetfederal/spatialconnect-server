(ns spacon.db.conn
  (:import com.mchange.v2.c3p0.ComboPooledDataSource)
  (:require [yesql.core :refer [defqueries]]
            [ragtime.jdbc :as jdbc]
            [ragtime.repl :as repl]
            [clojure.data.json :as json]
            [jdbc.pool.c3p0 :as pool]
            [clojure.tools.logging :as log]))

(def db-creds (or (some-> (System/getenv "VCAP_SERVICES")
                          (json/read-str :key-fn clojure.core/keyword) vals first first :credentials)
                  {:db_host  (or (System/getenv "DB_HOST") "localhost")
                   :db_port  5432
                   :db_name  (or (System/getenv "DB_NAME") "spacon")
                   :username (or (System/getenv "DB_USER") "spacon")
                   :password (or (System/getenv "DB_PASSWORD") "spacon")}))

(def db-spec
  (do
    (log/debug "Making db connection to"
               (format "%s:%s/%s" (:db_host db-creds) (:db_port db-creds) (:db_name db-creds)))
    (pool/make-datasource-spec
     {:classname   "org.postgresql.Driver"
      :subprotocol "postgresql"
      :subname     (format "//%s:%s/%s" (:db_host db-creds) (:db_port db-creds) (:db_name db-creds))
      :user        (:username db-creds)
      :password    (:password db-creds)
      :stringtype  "unspecified"
      :max-pool-size     10
      :min-pool-size     2
      :initial-pool-size 2})))

(defn loadconfig []
  (log/debug "Loading database migration config")
  {:datastore  (jdbc/sql-database db-spec)
   :migrations (jdbc/load-resources "migrations")})

(defn migrate []
  (log/debug "Running database migration")
  (repl/migrate (loadconfig)))

(defn rollback []
  (log/debug "Rolling back database migration")
  (repl/rollback (loadconfig)))
