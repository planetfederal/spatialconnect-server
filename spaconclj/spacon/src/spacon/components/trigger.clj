(ns spacon.components.trigger
  (:require [com.stuartsierra.component :as component]
            [spacon.db.conn :as db]
            [spacon.util.db :as dbutil]
            [yesql.core :refer [defqueries]]
            [spacon.http.intercept :as intercept]
            [ring.util.response :as ring-resp]
            [spacon.models.triggers :as model]
            [spacon.components.notification :as notification]
            [cljts.relation :as relation]
            [clojure.core.async :as async]
            [spacon.util.geo :as geoutil]
            [spacon.entity.notification :as ntf-entity]))

(def invalid-triggers (ref #{}))
(def valid-triggers (ref #{}))

(defn add-trigger [trigger]
  (dosync
    (commute invalid-triggers conj
             (geoutil/geojsonmap->filtermap trigger))))

(defn add-triggers [triggers]
  (map add-trigger triggers))

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

(defn- load-triggers []
  (let [tl (doall (model/trigger-list))]
    (add-triggers
      (map
        (fn [t] (:definition t))
        tl))))

(defn process-value [p notify]
  (map
    (fn [poly]
          (if (relation/within? (:geometry p) (:geometry poly))
            (notification/send->notification notify
               (ntf-entity/make-mobile-notification
                 {:to nil
                  :priority "alert"
                  :title "Alert"
                  :body "Point is in Polygon"}))))
       @invalid-triggers))

(defn http-get [_]
  (ring-resp/response {:response (model/trigger-list)}))

(defn http-get-trigger [context]
  (ring-resp/response {:response (model/find-trigger (get-in context [:path-params :id]))}))

(defn http-put-trigger [context]
  (let [t (:json-params context)
        r (ring-resp/response {:response (model/update-trigger (get-in context [:path-params :id])
                                                               t)})]
      (add-trigger (:definition t))
      r))

(defn http-post-trigger [context]
  (let [t (:json-params context)
        r (ring-resp/response {:response (model/create-trigger t)})]
    (add-trigger (:definition t))
    r))

(defn http-delete-trigger [context]
  (model/delete-trigger (get-in context [:path-params :id]))
  (ring-resp/response {:response "success"}))

(defn- process-channel [notify input-channel]
  (async/go (while true
      (let [v (async/<!! input-channel)]
        (process-value (geoutil/geojsonmap->filtermap v) notify)))))

(defn check-value [triggercomp v]
  (async/go (async/>!! (:source-channel triggercomp) v)))

(defn http-test-trigger [triggercomp context]
  (check-value triggercomp (:json-params context))
  (ring-resp/response {:response "success"}))

(defn- routes [triggercomp]
    #{["/api/triggers" :get
       (conj intercept/common-interceptors `http-get)]
      ["/api/triggers/:id" :get
       (conj intercept/common-interceptors `http-get-trigger)]
      ["/api/triggers/:id" :put
       (conj intercept/common-interceptors `http-put-trigger)]
      ["/api/triggers" :post
       (conj intercept/common-interceptors `http-post-trigger)]
      ["/api/triggers/:id" :delete
       (conj intercept/common-interceptors `http-delete-trigger)]
      ["/api/trigger/check" :post
       (conj intercept/common-interceptors (partial http-test-trigger triggercomp)) :route-name :http-test-trigger]})

(defrecord TriggerComponent [notify location]
  component/Lifecycle
  (start [this]
    (let [c (async/chan)
          comp (assoc this :source-channel c)]
      (process-channel notify c)
      (assoc comp :routes (routes comp))))
  (stop [this]
    (async/close! (:source-channel this))
    this))

(defn make-trigger-component []
  (map->TriggerComponent {}))
