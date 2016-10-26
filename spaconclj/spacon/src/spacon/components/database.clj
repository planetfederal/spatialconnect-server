(ns spacon.components.database
  (:require [com.stuartsierra.component :as component]))


(def db-spec {:classname "org.postgresql.Driver"
              :subprotocol "postgresql"
              :subname "//localhost:5432/spacon"
              :user "spacon"
              :password "spacon"})

(defrecord Database []
  component/Lifecycle
  (start [this]
    (assoc this :db db-spec))
  (stop [this]
    this))

(defn make-db-spec []
  (map->Database {}))