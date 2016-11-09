(ns spacon.components.organization
  (:require [com.stuartsierra.component :as component]
            [spacon.db.conn :as db]
            [yesql.core :refer [defqueries]]))

(defqueries "sql/organization.sql" {:connection db/db-spec})

(defrecord OrganizationComponent []
  component/Lifecycle
  (start [this]
    this)
  (stop [this]
    this))

(defn make-organization-component []
  (->OrganizationComponent))
