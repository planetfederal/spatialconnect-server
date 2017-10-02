;; Copyright 2016-2017 Boundless, http://boundlessgeo.com
;;
;; Licensed under the Apache License, Version 2.0 (the "License");
;; you may not use this file except in compliance with the License.
;; You may obtain a copy of the License at
;;
;; http://www.apache.org/licenses/LICENSE-2.0
;;
;; Unless required by applicable law or agreed to in writing, software
;; distributed under the License is distributed on an "AS IS" BASIS,
;; WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
;; See the License for the specific language governing permissions and
;; limitations under the License.

(ns spacon.db.conn
  (:import com.mchange.v2.c3p0.ComboPooledDataSource)
  (:require [ragtime.jdbc :as jdbc]
            [ragtime.repl :as repl]
            [clojure.data.json :as json]
            [jdbc.pool.c3p0 :as pool]
            [clojure.tools.logging :as log]))

(def db-creds (or (some-> (System/getenv "VCAP_SERVICES")
                          (json/read-str :key-fn clojure.core/keyword) :pg_95_XL_DEV_SHARED_001 first :credentials)
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

(defn create-schema []
  (log/debug "Creating schema if it doesnt exist")
  (clojure.java.jdbc/execute! db-spec ["CREATE SCHEMA IF NOT EXISTS spacon"]))

(defn loadconfig []
  (log/debug "Loading database migration config")
  (create-schema)
  {:datastore  (jdbc/sql-database db-spec {:migrations-table "spacon.migrations"})
   :migrations (jdbc/load-resources "migrations")})

(defn migrate []
  (log/debug "Running database migration")
  (repl/migrate (loadconfig)))

(defn rollback []
  (log/debug "Rolling back database migration")
  (repl/rollback (loadconfig)))
