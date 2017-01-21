(ns spacon.components.organization.core
  (:require [com.stuartsierra.component :as component]
            [spacon.db.conn :as db]
            [yesql.core :refer [defqueries]]
            [clojure.tools.logging :as log]))

(defrecord OrganizationComponent []
  component/Lifecycle
  (start [this]
    (log/debug "Starting Organization Component")
    this)
  (stop [this]
    (log/debug "Stopping Organization Component")
    this))

(defn make-organization-component []
  (->OrganizationComponent))

(defqueries "sql/organization.sql" {:connection db/db-spec})
