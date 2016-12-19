(ns spacon.components.organization.core
  (:require [com.stuartsierra.component :as component]
            [spacon.db.conn :as db]
            [yesql.core :refer [defqueries]]))

(defrecord OrganizationComponent []
  component/Lifecycle
  (start [this]
    this)
  (stop [this]
    this))

(defn make-organization-component []
  (->OrganizationComponent))

(defqueries "sql/organization.sql" {:connection db/db-spec})
