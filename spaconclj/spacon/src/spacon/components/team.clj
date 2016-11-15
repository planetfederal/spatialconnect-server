(ns spacon.components.team
  (:require [com.stuartsierra.component :as component]
            [com.stuartsierra.component :as component]
            [spacon.db.conn :as db]))

(defqueries "sql/team.sql" {:connection db/db-spec})

(defrecord TeamComponent []
  component/Lifecycle
  (start [this]
    this)
  (stop [this]
    this))

(defn make-team-component []
  (->TeamComponent))