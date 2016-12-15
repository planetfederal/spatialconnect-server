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
            [overtone.at-at :refer [every,mk-pool]]
            [clojure.xml :as xml])
  (:import (com.boundlessgeo.spatialconnect.schema SCCommand)))

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

(defn http-put-store [mqtt context]
  (if-let [d (storemodel/update (get-in context [:path-params :id]) (:json-params context))]
    (do (mqttapi/publish-scmessage mqtt "/config/update"
                                   (scm/map->SCMessage
                                    {:action (.value SCCommand/CONFIG_UPDATE_STORE)
                                     :payload d}))
        (response/ok "success"))
    (response/error "Error updating")))

(defn http-post-store [mqtt context]
  (if-let [d (storemodel/create (:json-params context))]
    (do (mqttapi/publish-scmessage mqtt "/config/update"
                                   (scm/map->SCMessage {:action (.value SCCommand/CONFIG_ADD_STORE)
                                                        :payload d}))
        (response/ok d))
    (response/error "Error creating")))

(defn http-delete-store [mqtt context]
  (let [id (get-in context [:path-params :id])]
    (storemodel/delete (get-in context [:path-params :id]))
    (mqttapi/publish-scmessage mqtt "/config/update"
                               (scm/map->SCMessage {:action (.value SCCommand/CONFIG_REMOVE_STORE)
                                                    :payload id}))
    (response/ok "success")))

(def polling-stores (ref {}))
(def sched-pool (mk-pool))

(defn feature-collection->geoms [fc]
  (if-let [features (.features fc)]
    (if (.hasNext features)
      (loop [feature (-> features .next .getDefaultGeometry)
             result []]
        (if (.hasNext features)
          (recur (-> features .next .getDefaultGeometry) (conj result feature))
          (conj result feature)))
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

(defn- routes [mqtt] #{["/api/stores" :get
                        (conj intercept/common-interceptors `http-get)]
                       ["/api/stores-error" :get
                        (conj intercept/common-interceptors `http-get-error)]
                       ["/api/stores/:id" :get
                        (conj intercept/common-interceptors `http-get-store)]
                       ["/api/stores/:id" :put
                        (conj intercept/common-interceptors (partial http-put-store mqtt)) :route-name :http-put-store]
                       ["/api/stores" :post
                        (conj intercept/common-interceptors (partial http-post-store mqtt)) :route-name :http-post-store]
                       ["/api/stores/:id" :delete
                        (conj intercept/common-interceptors (partial http-delete-store mqtt)) :route-name :http-delete-store]
                       ["/api/wfs/getCapabilities" :get
                        (conj intercept/common-interceptors `http-get-capabilities)]})

(defrecord StoreComponent [mqtt trigger]
  component/Lifecycle
  (start [this]
    (load-polling-stores)
    (start-polling trigger)
    (assoc this :routes (routes mqtt)))
  (stop [this]
    this))

(defn make-store-component []
  (map->StoreComponent {}))
