(ns spacon.components.store
  (:require [com.stuartsierra.component :as component]
            [spacon.http.intercept :as intercept]
            [spacon.http.response :as response]
            [spacon.models.store :as storemodel]
            [spacon.components.trigger :as triggerapi]
            [clj-http.client :as client]
            [cljts.io :as jtsio]
            [clojure.data.json :as json]
            [overtone.at-at :refer [every,mk-pool]]))

(defn http-get [context]
  (if-let [d (storemodel/all)]
    (response/ok d)
    (response/error "Error")))

(defn http-get-error [context]
  (response/error "Error"))

(defn http-get-store [context]
  (if-let [d (storemodel/find-by-id (get-in context [:path-params :id]))]
    (response/ok d)
    (response/error "Error retrieving store")))

(defn http-put-store [context]
  (if-let [d (storemodel/update (get-in context [:path-params :id])
                                (:json-params context))]
    (response/ok "success")
    (response/error "Error updating")))

(defn http-post-store [context]
  (if-let [d (storemodel/create (:json-params context))]
    (response/ok d)
    (response/error "Error creating")))

(defn http-delete-store [context]
  (storemodel/delete (get-in context [:path-params :id]))
  (response/ok "success"))

(def polling-stores (ref {}))
(def sched-pool (mk-pool))

(defn feature-collection->geoms [fc]
  (if-let [features (.features fc)]
    (if (.hasNext features)
      (loop [feature (-> features .next .getDefaultGeometry)
             result []]
        (if (.hasNext features)
          (recur (-> features .next .getDefaultGeometry) (conj result feature))
          result))
      [])
    []))

(defn fetch-url [trigger url]
  (println "Fetching:" url)
  (let [res (client/get url)
        status (:status res)
        body (:body res)]
    (if (= status 200)
      (let [geoms (-> body
                      jtsio/read-feature-collection
                      feature-collection->geoms)]
        (doall (map (fn [g]
              (triggerapi/test-value trigger "STORE" g)) geoms)))
      (println "Error "))))

(defn start-polling [trigger]
  (doall
    (map
      (fn [k]
        (let [s (k @polling-stores)
              seconds (get-in s [:options :polling])]
          (every (* 1000 (Integer/parseInt seconds))
            #(fetch-url trigger (:uri s)) sched-pool :initial-delay 5000)))
      (keys @polling-stores))))

(defn add-polling-store [s]
  (if (not-empty (get-in s [:options :polling]))
    (dosync
     (commute polling-stores assoc (keyword (:id s)) s))))

(defn remove-polling-store [id]
  (dosync
   (commute polling-stores dissoc (keyword id))))

(defn load-polling-stores []
  (doall (map add-polling-store (storemodel/all))))

(defn- routes [] #{["/api/stores" :get
                    (conj intercept/common-interceptors `http-get)]
                   ["/api/stores-error" :get
                    (conj intercept/common-interceptors `http-get-error)]
                   ["/api/stores/:id" :get
                    (conj intercept/common-interceptors `http-get-store)]
                   ["/api/stores/:id" :put
                    (conj intercept/common-interceptors `http-put-store)]
                   ["/api/stores" :post
                    (conj intercept/common-interceptors `http-post-store)]
                   ["/api/stores/:id" :delete
                    (conj intercept/common-interceptors `http-delete-store)]})

(defrecord StoreComponent [trigger]
  component/Lifecycle
  (start [this]
    (load-polling-stores)
    (start-polling trigger)
    (assoc this :routes (routes)))
  (stop [this]
    this))

(defn make-store-component []
  (map->StoreComponent {}))
