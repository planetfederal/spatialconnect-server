(ns spacon.components.organization
  (:require [com.stuartsierra.component :as component]))

(defqueries "sql/organization.sql" {:connection db-spec})

(defrecord OrganizationComponent []
  component/Lifecycle
  (start [this]
    this)
  (stop [this]
    this))

(defn make-organization-component []
  (->OrganizationComponent))
