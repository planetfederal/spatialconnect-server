(ns spacon.components.team.core
  (:require [com.stuartsierra.component :as component]
            [yesql.core :refer [defqueries]]
            [spacon.http.intercept :as intercept]
            [spacon.http.response :as response]
            [spacon.components.team.db :as teammodel]
            [spacon.db.conn :as db]))

(defn http-get [context]
  (if-let [d (teammodel/all)]
    (response/ok d)
    (response/error "Error")))

(defn http-get-team [context]
  (if-let [d (teammodel/find-by-id (get-in context [:path-params :id]))]
    (response/ok d)
    (response/error "Error retrieving team")))

(defn http-post-team [context]
  (if-let [d (teammodel/create (:json-params context))]
    (response/ok d)
    (response/error "Error creating")))

(defn http-delete-team [context]
  (teammodel/delete (get-in context [:path-params :id]))
  (response/ok "success"))

(defn- routes [] #{["/api/teams" :get
                    (conj intercept/common-interceptors `http-get)]
                   ["/api/teams/:id" :get
                    (conj intercept/common-interceptors `http-get-team)]
                   ["/api/teams" :post
                    (conj intercept/common-interceptors `http-post-team)]
                   ["/api/teams/:id" :delete
                    (conj intercept/common-interceptors `http-delete-team)]})

(defrecord TeamComponent []
  component/Lifecycle
  (start [this]
    (assoc this :routes (routes)))
  (stop [this]
    this))

(defn make-team-component []
  (->TeamComponent))
