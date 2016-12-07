(ns spacon.db.conn
  (:import com.mchange.v2.c3p0.ComboPooledDataSource)
  (:require [yesql.core :refer [defqueries]]
            [ragtime.jdbc :as jdbc]
            [ragtime.repl :as repl]
            [clojure.data.json :as json]
            [jdbc.pool.c3p0 :as pool]))

(def db-creds (or (some->(System/getenv "VCAP_SERVICES")
                         (json/read-str :key-fn clojure.core/keyword) vals first first :credentials)
                  {:db_host  (or (System/getenv "DB_HOST") "localhost")
                   :db_name  "spacon"
                   :db_port  5432
                   :username "spacon"
                   :password "spacon"}))


(def db-spec
  (pool/make-datasource-spec
    {:classname   "org.postgresql.Driver"
     :subprotocol "postgresql"
     :subname     (format "//%s:%s/%s" (:db_host db-creds) (:db_port db-creds) (:db_name db-creds))
     :user        (:username db-creds)
     :password    (:password db-creds)}))


(defn loadconfig []
  {:datastore  (jdbc/sql-database db-spec)
   :migrations (jdbc/load-resources "migrations")})

(defn migrate [] (repl/migrate (loadconfig)))

(defn rollback [] (repl/rollback (loadconfig)))
