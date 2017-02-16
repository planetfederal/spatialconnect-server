;; Copyright 2017 Boundless, http://boundlessgeo.com
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

(ns spacon.components.layer.db
  (:require [spacon.db.conn :as db]
            [yesql.core :refer [defqueries]]
            [clojure.java.jdbc :as jdbc]
            [clojure.data.json :as json]
            [camel-snake-kebab.core :refer :all]
            [camel-snake-kebab.extras :refer [transform-keys]]
            [spacon.util.db :as dbutil]))

;; define sql queries as functions in this namespace
(defqueries "sql/layer.sql" {:connection db/db-spec})

;; todo: remove this in favor of extending IResultSetReadColumn
(defn- extent->vec [row]
  (assoc row :extent (vec (.getArray (:extent row)))))

;; todo: we should pass a database component down into these functions
(defn create-layer
  [layer-config]
  (let [props (json/write-str (:properties layer-config))
        bbox (dbutil/->FloatArray (float-array (:extent layer-config)))
        new-layer (create<! (assoc layer-config :properties props :extent bbox))]
    (extent->vec new-layer)))

(defn list-layers
  [offset limit]
  (find-all {:offset offset :limit limit}
            {:row-fn extent->vec}))

(defn get-layer-by-id
  [id]
  (find-by-id-query {:id id}
                    {:row-fn extent->vec}))
