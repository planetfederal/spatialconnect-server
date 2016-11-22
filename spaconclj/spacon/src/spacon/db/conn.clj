(ns spacon.db.conn
  (:import com.mchange.v2.c3p0.ComboPooledDataSource)
  (:require [yesql.core :refer [defqueries]]
            [ragtime.jdbc :as jdbc]
            [ragtime.repl :as repl]
            [cheshire.core :refer [parse-string]]
            [jdbc.pool.c3p0 :as pool]))

(defn get-db-uri-from-env
  []
  (or (some-> (System/getenv "VCAP_SERVICES")
              (parse-string true)
              :elephantsql first :credentials :uri java.net.URI.)
      (some-> (System/getenv "DATABASE_URI") java.net.URI.)))

(def db-uri (or (get-db-uri-from-env)
                (java.net.URI. "postgresql://spacon:spacon@localhost:5432/spacon")))

(def user-pass (clojure.string/split (.getUserInfo db-uri) #":"))

(def db-spec
  (pool/make-datasource-spec
    {:classname   "org.postgresql.Driver"
     :subprotocol "postgresql"
     :subname     (if (= -1 (.getPort db-uri))
                      (format "//%s%s" (.getHost db-uri) (.getPath db-uri))
                      (format "//%s:%s%s" (.getHost db-uri) (.getPort db-uri) (.getPath db-uri)))
     :user         (first user-pass)
     :password     (second user-pass)}))


(defn loadconfig []
  {:datastore  (jdbc/sql-database db-spec)
   :migrations (jdbc/load-resources "migrations")})

(defn migrate [] (repl/migrate (loadconfig)))

(defn rollback [] (repl/rollback (loadconfig)))