;; Copyright 2016-2017 Boundless, http://boundlessgeo.com
;;
;; Licensed under the Apache License, Version 2.0 (the "License");
;; you may not use this file except in compliance with the License.
;; You may obtain a copy of the License at
;;
;; http://www.apache.org/licenses/LICENSE-2.0
;;
;; Unless required by applicable law or agreed to in writing, software
;; distributed under the License is distributed on an "AS IS" BASIS,
;; WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
;; See the License for the specific language governing permissions and
;; limitations under the License.

(ns spacon.components.store.core
  (:require [com.stuartsierra.component :as component]
            [spacon.http.intercept :as intercept]
            [spacon.http.response :as response]
            [spacon.components.store.db :as storemodel]
            [spacon.components.trigger.core :as triggerapi]
            [clj-http.client :as client]
            [cljts.io :as jtsio]
            [spacon.components.mqtt.core :as mqttapi]
            [spacon.entity.scmessage :as scm]
            [clojure.data.json :as json]
            [clojure.xml :as xml]
            [overtone.at-at :refer [every,mk-pool,stop,stop-and-reset-pool!]]
            [clojure.tools.logging :as log]
            [clojure.spec :as s])
  (:import (com.boundlessgeo.spatialconnect.schema SCCommand)))

(defn feature-collection->geoms
  "Given a geojson feature collection, return a list of the features' geometries"
  [fc]
  (if-let [features (.features fc)]
    (if (.hasNext features)
      (loop [feature (-> features .next .getDefaultGeometry)
             result []]
        (if (.hasNext features)
          (recur (-> features .next .getDefaultGeometry) (conj result feature))
          result))
      [])
    []))

(defn fetch-url
  "Fetches geojson from url and tests each feature for the specified trigger"
  [trigger url]
  (log/debug "Fetching" url)
  (let [res (client/get url)
        status (:status res)
        body (:body res)]
    (if (= status 200)
      (let [geoms (-> body
                      jtsio/read-feature-collection
                      feature-collection->geoms)]
        (doall (map (fn [g]
                      (triggerapi/test-value trigger "STORE" g)) geoms)))
      (log/error "Error Fetching" url))))

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

(defn http-get-all-stores
  "Returns http response of all stores"
  [_]
  (log/debug "Getting all stores")
  (response/ok (storemodel/all)))

(defn http-get-store
  "Gets a store by id"
  [request]
  (log/debug "Getting store by id")
  (let [id (get-in request [:path-params :id])]
    (if-let [store (storemodel/find-by-id id)]
      (response/ok store)
      (let [err-msg (str "No store found for id" id)]
        (log/warn err-msg)
        (response/not-found err-msg)))))

(defn http-put-store
  "Updates a store using the json body then publishes
  a config update message about the newly updated store"
  [mqtt trigger request]
  (log/debug "Updating store")
  (let [store (:json-params request)
        id (get-in request [:path-params :id])]
    (if (s/valid? :spacon.specs.store/store-spec store)
      (let [updated-store (storemodel/modify id store)]
        (mqttapi/publish-scmessage mqtt "/config/update"
                                   (scm/map->SCMessage
                                    {:action (.value SCCommand/CONFIG_UPDATE_STORE)
                                     :payload updated-store}))
        (add-polling-store trigger updated-store)
        (response/ok updated-store))
      (let [err-msg "Failed to update store"]
        (log/error (str err-msg "b/c" (s/explain-str :spacon.specs.store/store-spec store)))
        (response/bad-request err-msg)))))

(defn http-post-store
  "Creates a new store using the json body then publishes
  a config update message about the newly updated store"
  [mqtt trigger request]
  (let [store (:json-params request)]
    (log/debug "Validating store")
    (if (s/valid? :spacon.specs.store/store-spec store)
      (let [new-store (storemodel/create store)]
        (log/debug "Added new store")
        (mqttapi/publish-scmessage mqtt "/config/update"
                                   (scm/map->SCMessage
                                    {:action (.value SCCommand/CONFIG_ADD_STORE)
                                     :payload new-store}))
        (add-polling-store trigger new-store)
        (response/ok new-store))
      (let [err-msg "Failed to create new store"]
        (log/error (str err-msg "b/c" (s/explain-str :spacon.specs.store/store-spec store)))
        (response/bad-request err-msg)))))

(defn http-delete-store
  "Deletes a store by id then publishes a config update message about
  the delted store"
  [mqtt request]
  (log/debug "Deleting store")
  (let [id (get-in request [:path-params :id])
        store (storemodel/find-by-id id)]
    (if (nil? store)
      (let [err-msg (str "No store found with id" id)]
        (log/error err-msg)
        (response/bad-request err-msg))
      (do
        (storemodel/delete id)
        (remove-polling-store id)
        (mqttapi/publish-scmessage mqtt "/config/update"
                                   (scm/map->SCMessage
                                    {:action (.value SCCommand/CONFIG_REMOVE_STORE)
                                     :payload {:id id}}))
        (response/ok "success")))))

(defn get-capabilities->layer-names
  "Takes a WFS GetCapabilities document as an xml string and returns
  a list of layer names specified in the document"
  [caps]
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

(defn http-get-capabilities
  "Makes a request to a WFS endpoint specified by the 'url'
  query parmeter.  Used as a proxy to avoid cross origin issues."
  [request]
  (let [url (get-in request [:query-params :url])
        res (client/get (str url "?service=WFS&version=1.1.0&request=GetCapabilities")  {:ignore-unknown-host? true})
        status (:status res)
        body (:body res)]
    (if (= status 200)
      (response/ok (get-capabilities->layer-names body))
      (response/bad-request (str "Could not get capabilities from " url)))))

(defn- routes [mqtt trigger]
  #{["/api/stores" :get
     (conj intercept/common-interceptors `http-get-all-stores)]
    ["/api/stores/:id" :get
     (conj intercept/common-interceptors `http-get-store)]
    ["/api/stores/:id" :put
     (conj intercept/common-interceptors (partial http-put-store mqtt trigger)) :route-name :http-put-store]
    ["/api/stores" :post
     (conj intercept/common-interceptors (partial http-post-store mqtt trigger)) :route-name :http-post-store]
    ["/api/stores/:id" :delete
     (conj intercept/common-interceptors (partial http-delete-store mqtt)) :route-name :http-delete-store]
    ["/api/wfs/getCapabilities" :get
     (conj intercept/common-interceptors `http-get-capabilities)]})

(defrecord StoreComponent [mqtt trigger]
  component/Lifecycle
  (start [this]
    (log/debug "Starting Store Component")
    (load-polling-stores trigger)
    (assoc this :routes (routes mqtt trigger)))
  (stop [this]
    (log/debug "Stopping Store Component")
    this))

(defn make-store-component []
  (map->StoreComponent {}))
