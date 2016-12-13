(ns spacon.components.team
  (:require [com.stuartsierra.component :as component]
            [yesql.core :refer [defqueries]]
            [spacon.http.intercept :as intercept]
            [spacon.http.response :as response]
            [spacon.models.teams :as teammodel]
            [spacon.db.conn :as db]))

(defn http-get [context]
  (if-let [d (teammodel/all)]
    (response/ok d)
    (response/error "Error")))

(defn http-post-team [context]
  (if-let [d (teammodel/create (:json-params context))]
    (response/ok d)
    (response/error "Error creating")))

(defn- routes [] #{["/api/teams" :get
                    (conj intercept/common-interceptors `http-get)]
                   ["/api/teams" :post
                    (conj intercept/common-interceptors `http-post-team)]})

(defrecord TeamComponent []
  component/Lifecycle
  (start [this]
    (assoc this :routes (routes)))
  (stop [this]
    this))

(defn make-team-component []
  (->TeamComponent))