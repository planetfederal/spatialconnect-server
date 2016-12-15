(ns spacon.components.store
  (:require [com.stuartsierra.component :as component]
            [spacon.http.intercept :as intercept]
            [spacon.http.response :as response]
            [spacon.models.store :as storemodel]
            [spacon.components.trigger :as triggerapi]
            [clj-http.client :as client]
            [cljts.io :as jtsio]
            [spacon.components.mqtt :as mqttapi]
            [spacon.entity.scmessage :as scm]
            [clojure.data.json :as json]
            [clojure.xml :as xml]
            [overtone.at-at :refer [every,mk-pool,stop,stop-and-reset-pool!]])
  (:import (com.boundlessgeo.spatialconnect.schema SCCommand)))

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
      (println "Error Fetching " url))))

(def polling-stores (ref {}))
(def sched-pool (mk-pool))

(defn start-polling [trigger store]
  (let [seconds (get-in store [:options :polling])]
    (every (* 1000 (Integer/parseInt seconds))
           #(fetch-url trigger (:uri store)) sched-pool
           :job (keyword (:id store)) :initial-delay 5000)))

(defn stop-polling [store]
  (stop (keyword (:id store))))

(defn add-polling-store [trigger s]
  (if (not-empty (get-in s [:options :polling]))
    (do
      (dosync
       (commute polling-stores assoc (keyword (:id s)) s))
      (start-polling trigger s))))

(defn remove-polling-store [id]
  ; takes a store id string
  (dosync
   (commute polling-stores dissoc (keyword id)))
  (stop-polling (keyword id)))

(defn load-polling-stores [trigger]
  (doall (map (partial add-polling-store trigger) (storemodel/all))))

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

(defn http-put-store [mqtt trigger context]
  (if-let [d (storemodel/update (get-in context [:path-params :id]) (:json-params context))]
    (do (mqttapi/publish-scmessage mqtt "/config/update"
                                   (scm/map->SCMessage
                                    {:action (.value SCCommand/CONFIG_UPDATE_STORE)
                                     :payload d}))
        (add-polling-store trigger d)
        (response/ok "success"))
    (response/error "Error updating")))

(defn http-post-store [mqtt trigger context]
  (if-let [d (storemodel/create (:json-params context))]
    (do (mqttapi/publish-scmessage mqtt "/config/update"
                                   (scm/map->SCMessage {:action (.value SCCommand/CONFIG_ADD_STORE)
                                                        :payload d}))
        (add-polling-store trigger d)
        (response/ok d))
    (response/error "Error creating")))

(defn http-delete-store [mqtt context]
  (let [id (get-in context [:path-params :id])]
    (storemodel/delete (get-in context [:path-params :id]))
    (remove-polling-store id)
    (mqttapi/publish-scmessage mqtt "/config/update"
                               (scm/map->SCMessage {:action (.value SCCommand/CONFIG_REMOVE_STORE)
                                                    :payload id}))

    (response/ok "success")))

(defn get-capabilities->layer-names [caps]
  (let [layer-names (->> caps
                         .getBytes
                         java.io.ByteArrayInputStream.
                         xml/parse
                         :content
                         (filter #(= :FeatureTypeList (:tag %)))
                         first
                         :content
                         (filter #(= :FeatureType (:tag %)))
                         (map #(first (:content (first (:content %))))))]
    layer-names))

(defn http-get-capabilities [context]
  (let [url (get-in context [:query-params :url])
        res (client/get (str url "?service=WFS&version=1.1.0&request=GetCapabilities"))
        status (:status res)
        body (:body res)]
    (if (= status 200)
      (response/ok (get-capabilities->layer-names body))
      (response/error (str "Could not get capabilities from " url)))))

(defn- routes [mqtt trigger]
  #{["/api/stores" :get
                                (conj intercept/common-interceptors `http-get)]
                               ["/api/stores-error" :get
                                (conj intercept/common-interceptors `http-get-error)]
                               ["/api/stores/:id" :get
                                (conj intercept/common-interceptors `http-get-store)]
                               ["/api/stores/:id" :put
                                (conj intercept/common-interceptors (partial http-put-store mqtt trigger)) :route-name :http-put-store]
                               ["/api/stores" :post
                                (conj intercept/common-interceptors (partial http-post-store mqtt trigger)) :route-name :http-post-store]
                               ["/api/stores/:id" :delete
                                (conj intercept/common-interceptors (partial http-delete-store mqtt)) :route-name :http-delete-store]})

(defrecord StoreComponent [mqtt trigger]
  component/Lifecycle
  (start [this]
    (load-polling-stores trigger)
    (assoc this :routes (routes mqtt trigger)))
  (stop [this]
    this))

(defn make-store-component []
  (map->StoreComponent {}))
