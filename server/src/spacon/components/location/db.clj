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

(ns spacon.components.location.db
  (:require [spacon.db.conn :as db]
            [yesql.core :refer [defqueries]]
            [cljts.io :as jio]
            [cljts.geom :as jeom]))

;; define sql queries as functions in this namespace
(defqueries "sql/location.sql" {:connection db/db-spec})

(defn- sanitize
  [location]
  (dissoc location :created_at :updated_at :deleted_at))

(defn- entity->map [c]
  (assoc c :device_info (:device_info c)
         :geometry (jio/read-wkt-str (:geom c))
         :updated_at (.toString (:updated_at c))))

(defn all
  "Gets all the device locations"
  []
  (map (fn [d]
         (entity->map d)) (device-locations)))

(defn upsert
  "Upserts a JTS point geometry and a client identifier"
  [p client]
  (upsert-location! {:geom (jio/write-wkt-str p) :identifier client}))

(defn upsert-gj
  "Upserts a geojson structured map"
  [loc]
  (let [x (get-in loc [:geometry :coordinates 0])
        y (get-in loc [:geometry :coordinates 1])
        z (get-in loc [:geometry :coordinates 2] 0)
        p (jeom/point (jeom/c x y z))
        did (get-in loc [:metadata :client])]
    (upsert p did)))
