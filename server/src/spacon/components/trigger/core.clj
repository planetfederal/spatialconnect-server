(ns spacon.components.trigger.core
  (:require [com.stuartsierra.component :as component]
            [yesql.core :refer [defqueries]]
            [clojure.spec :as s]
            [spacon.http.intercept :as intercept]
            [spacon.http.response :as response]
            [spacon.components.trigger.db :as triggermodel]
            [spacon.components.notification.core :as notificationapi]
            [clojure.core.async :as async]
            [spacon.entity.notification
             :refer [make-mobile-notification, make-email-notification]]
            [cljts.io :as jtsio]
            [spacon.trigger.protocol :as proto-clause]
            [clojure.data.json :as json]
            [spacon.trigger.definition.geo
             :refer [make-within-clause]]))

(def invalid-triggers (ref {}))
(def valid-triggers (ref {}))

(defn add-trigger [trigger]
  (let [t (assoc trigger :rules
                         (map (fn [rule]
                                (case (:comparator rule)
                                  "$geowithin" (make-within-clause
                                                 (:id trigger) (:rhs rule))
                                  nil)) (:rules trigger)))]
    (dosync
      (commute invalid-triggers assoc
               (keyword (:id t)) t))))

(defn remove-trigger [trigger]
  (dosync
    (commute invalid-triggers dissoc (keyword (:id trigger)))
    (commute valid-triggers dissoc (keyword (:id trigger)))))

(defn set-valid-trigger [trigger]
  (dosync
    (commute invalid-triggers dissoc (keyword (:id trigger)))
    (commute valid-triggers assoc (keyword (:id trigger)) trigger)))

(defn set-invalid-trigger [trigger]
  (dosync
    (commute invalid-triggers assoc (keyword (:id trigger)) trigger)
    (commute valid-triggers dissoc (keyword (:id trigger)))))

(defn load-triggers []
  (let [tl (doall (triggermodel/all))]
    (doall (map add-trigger tl))))

(defn- handle-success [value trigger notify]
  (let [body    (doall (map #(proto-clause/notification % value) (:rules trigger)))
        emails  (get-in trigger [:recipients :emails])
        devices (get-in trigger [:recipients :devices])
        trigger (triggermodel/find-by-id (:id trigger))
        payload {:time    (str (new java.util.Date))
                 :value   (json/read-str (jtsio/write-geojson value))
                 :trigger trigger}]
    (do
      (if (some? devices)
        (notificationapi/notify
          notify
          (make-mobile-notification
            {:to       devices
             :priority "alert"
             :title    (str "Alert for Trigger: " (:name trigger))
             :body     body
             :payload  payload})
          "trigger"
          payload))
      (if (some? emails)
        (notificationapi/notify
          notify
          (make-email-notification
            {:to       emails
             :priority "alert"
             :title    (str "Alert for Trigger: " (:name trigger))
             :body     body
             :payload  payload})
          "trigger"
          payload)))))

(defn- handle-failure [trigger]
  (if (nil? ((keyword (:id trigger)) @valid-triggers))
    (set-invalid-trigger trigger)))

(defn process-value
  "Store Value Notifycomponent"
  [store value notify]
  (doall (map (fn [k]
                (if-let [trigger (k @invalid-triggers)]
                  (if-not (empty? (:rules trigger))
                    (loop [rules (:rules trigger)]
                      (if (empty? rules)
                        ; All the rules have passed, send a notification
                        (handle-success value trigger notify)
                        (if-let [rule (first rules)]
                          (if (proto-clause/check rule value)
                            (recur (rest rules))
                            (handle-failure trigger))))))))
              (keys @invalid-triggers))))

(defn http-get [_]
  (response/ok (triggermodel/all)))

(defn http-get-trigger [context]
  (response/ok
    (triggermodel/find-by-id
      (get-in context [:path-params :id]))))

(defn http-put-trigger [context]
  (let [t (:json-params context)]
    (if (s/valid? :spacon.specs.trigger/trigger-spec t)
      (let [trigger (triggermodel/modify (get-in context [:path-params :id]) t)
            res     (response/ok trigger)]
        (add-trigger trigger)
        res)
      (response/error
        (str "Failed to update trigger:\n"
             (s/explain-str :spacon.specs.trigger/trigger-spec t))))))

(defn http-post-trigger [context]
  (let [t (:json-params context)]
    (if (s/valid? :spacon.specs.trigger/trigger-spec t)
      (let [trigger (triggermodel/create t)
            res (response/ok trigger)]
        (add-trigger trigger)
        res)
      (response/error (str "Failed to create trigger:\n"
                           (s/explain-str :spacon.specs.trigger/trigger-spec t))))))

(defn http-delete-trigger [context]
  (let [id (get-in context [:path-params :id])]
    (triggermodel/delete id)
    (remove-trigger {:id id})
    (response/ok "success")))

(defn process-channel [notify input-channel]
  (async/go (while true
              (let [v (async/<! input-channel)
                    pt (:value v)]
                (do (process-value (:store v) pt notify))))))

(defn test-value [triggercomp store value]
  ;trigger component, source store string, value to test
  (async/go (async/>! (:source-channel triggercomp)
                      {:store store :value value})))

(defn http-test-trigger [triggercomp context]
  (test-value triggercomp "http-api"
              (-> (:json-params context)
                  json/write-str
                  jtsio/read-feature
                  .getDefaultGeometry))
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
          comp (assoc this :source-channel c :notify notify)]
      (process-channel (:notify comp) (:source-channel comp))
      (load-triggers)
      (assoc comp :routes (routes comp))))
  (stop [this]
    (async/close! (:source-channel this))
    this))

(defn make-trigger-component []
  (map->TriggerComponent {}))

