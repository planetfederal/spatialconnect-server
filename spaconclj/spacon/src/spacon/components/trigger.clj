(ns spacon.components.trigger
  (:require [com.stuartsierra.component :as component]
            [yesql.core :refer [defqueries]]
            [spacon.http.intercept :as intercept]
            [spacon.http.response :as response]
            [spacon.models.triggers :as model]
            [spacon.components.notification :as notification]
            [cljts.relation :as relation]
            [clojure.core.async :as async]
            [spacon.entity.notification :as ntf-entity]
            [cljts.io :as jtsio]
            [clojure.data.json :as json]))

(def invalid-triggers (ref {}))
(def valid-triggers (ref {}))

(defn geojsonmap->filtermap [f]
  (assoc f :rules (map (fn [rule]
                         (let [nr (jtsio/read-feature-collection (json/write-str (:rhs rule)))]
                           (assoc rule :rhs nr)))
                       (:rules f))))

(defn add-trigger [trigger]
  (let [t (geojsonmap->filtermap trigger)]
    (dosync
      (commute invalid-triggers assoc (keyword (:id t)) t))))

(defn remove-trigger [trigger]
  (dosync
    (commute invalid-triggers dissoc (keyword (:id trigger)))
    (commute valid-triggers dissoc (keyword (:id trigger)))))

(defn set-valid-trigger [trigger]
  (dosync
    (commute invalid-triggers dissoc (keyword (:id trigger)))
    (commute valid-triggers assoc (keyword (:id trigger)))))

(defn set-invalid-trigger [trigger]
  (dosync
    (commute invalid-triggers assoc (keyword (:id trigger)) trigger)
    (commute valid-triggers dissoc (keyword (:id trigger)))))

(defn- load-triggers []
  (let [tl (doall (model/trigger-list))]
    (doall (map (fn [t]
           (add-trigger t)) tl))))

(defn geowithin [p poly]
  (relation/within? p poly))

(defn- handle-success [trigger notify]
  (if (:repeated trigger)
    (set-valid-trigger trigger)
    (remove-trigger trigger))
  (notification/send->notification notify
                                   (ntf-entity/make-mobile-notification
                                     {:to nil
                                      :priority "alert"
                                      :title "Alert"
                                      :body "Point is in Polygon"})))
(defn- handle-failure [trigger]
  (if (nil? ((keyword (:id trigger)) @valid-triggers))
    (set-invalid-trigger trigger)))

(defn process-value [p notify]
  (map
    (fn [trigger]
      (map (fn [rule]
             (let [rhs (:rhs rule)
                   lhs (:lhs rule)
                   cmp (:comparator rule)]
               (case cmp
                 "$geowithin" (if (geowithin p rhs)
                                (handle-success trigger notify)
                                (handle-failure trigger)))))
           (:rules trigger)))
       @invalid-triggers))

(defn http-get [_]
  (response/ok (model/trigger-list)))

(defn http-get-trigger [context]
  (response/ok (model/find-trigger (get-in context [:path-params :id]))))

(defn http-put-trigger [context]
  (let [t (:json-params context)
        r (response/ok (model/update-trigger (get-in context [:path-params :id]) t))]
      (add-trigger t)
      r))

(defn http-post-trigger [context]
  (let [t (:json-params context)
        r (response/ok (model/create-trigger t))]
    (add-trigger t)
    r))

(defn http-delete-trigger [context]
  (let [id (get-in context [:path-params :id])]
    (model/delete-trigger id)
    (remove-trigger {:id id})
    (response/ok "success")))

(defn- process-channel [notify input-channel]
  (async/go (while true
      (let [v (async/<!! input-channel)]
        (process-value (geojsonmap->filtermap v) notify)))))

(defn check-value [triggercomp v]
  (async/go (async/>!! (:source-channel triggercomp) v)))

(defn http-test-trigger [triggercomp context]
  (check-value triggercomp (:json-params context))
  (response/ok "success"))

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
      (load-triggers)
      (assoc comp :routes (routes comp))))
  (stop [this]
    (async/close! (:source-channel this))
    this))

(defn make-trigger-component []
  (map->TriggerComponent {}))
