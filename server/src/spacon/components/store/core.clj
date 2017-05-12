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
            [spacon.components.store.db :as storemodel]
            [clj-http.client :as client]
            [cljts.io :as jtsio]
            [spacon.specs.store]
            [spacon.components.kafka.core :as kafkaapi]
            [overtone.at-at :refer [every, mk-pool, stop, stop-and-reset-pool!]]
            [clojure.tools.logging :as log])
  (:import (com.boundlessgeo.schema Actions)))

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


(defn create [store-comp s]
  (storemodel/create s))

(defn modify [store-comp id s]
  (storemodel/modify id s))

(defn find-by-id [store-comp id]
  (storemodel/find-by-id id))

(defn delete [store-comp id]
  (storemodel/delete id))

(defn all [store-comp]
  (storemodel/all))

(defrecord StoreComponent []
  component/Lifecycle
  (start [this]
    (log/debug "Starting Store Component")
    this)
  (stop [this]
    (log/debug "Stopping Store Component")
    this))

(defn make-store-component []
  (map->StoreComponent {}))
