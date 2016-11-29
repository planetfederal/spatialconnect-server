(ns spacon.components.team
  (:require [com.stuartsierra.component :as component]
            [yesql.core :refer [defqueries]]
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