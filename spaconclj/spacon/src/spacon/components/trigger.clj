(ns spacon.components.trigger
  (:require [com.stuartsierra.component :as component]
            [yesql.core :refer [defqueries]]
            [spacon.http.intercept :as intercept]
            [ring.util.response :as ring-resp]
            [spacon.models.triggers :as model]
            [cljts.relation :as relation]))

(def invalid-triggers (ref #{}))
(def valid-triggers (ref #{}))

(defn add-trigger [trigger]
  (dosync
    (commute invalid-triggers conj trigger)))

(defn remove-trigger [trigger]
  (dosync
    (commute invalid-triggers disj trigger)
    (commute valid-triggers disj trigger)))

(defn set-valid-trigger [trigger]
  (dosync
    (commute invalid-triggers disj trigger)
    (commute valid-triggers conj trigger)))

(defn set-invalid-trigger [trigger]
  (dosync
    (commute invalid-triggers conj trigger)
    (commute valid-triggers disj trigger)))

(defn check-value [pt]
  (map (fn [t]
          (if (relation/within? pt t)
            (comp (set-valid-trigger t) (println "notify"))))
       @invalid-triggers))

(defn http-get [_]
  (ring-resp/response {:response (model/trigger-list)}))

(defn http-get-trigger [context]
  (ring-resp/response {:response (model/find-trigger (get-in context [:path-params :id]))}))

(defn http-put-trigger [context]
  (ring-resp/response {:response (model/update-trigger (get-in context [:path-params :id])
                                                 (:json-params context))}))

(defn http-post-trigger [context]
  (ring-resp/response {:response (model/create-trigger (:json-params context))}))

(defn http-delete-trigger [context]
  (model/delete-trigger (get-in context [:path-params :id]))
  (ring-resp/response {:response "success"}))

(defn- routes [] #{["/api/triggers" :get
                    (conj intercept/common-interceptors `http-get)]
                   ["/api/triggers/:id" :get
                    (conj intercept/common-interceptors `http-get-trigger)]
                   ["/api/triggers/:id" :put
                    (conj intercept/common-interceptors `http-put-trigger)]
                   ["/api/triggers" :post
                    (conj intercept/common-interceptors `http-post-trigger)]
                   ["/api/triggers/:id" :delete
                    (conj intercept/common-interceptors `http-delete-trigger)]})

(defrecord TriggerComponent [notify]
  component/Lifecycle
  (start [this]
    (assoc this :routes (routes)))
  (stop [this]
    this))

(defn make-trigger-component []
  (->TriggerComponent nil))
