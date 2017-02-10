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

(ns spacon.components.organization.db
  (:require [clojure.spec :as s]
            [spacon.specs.organization :as specs]
            [spacon.db.conn :as db]
            [clojure.set :refer [rename-keys]]
            [yesql.core :refer [defqueries]]
            [clojure.tools.logging :as log]))

;; define sql queries as functions in this namespace
(defqueries "sql/organization.sql" {:connection db/db-spec})

(defn sanitize [org]
  (dissoc org :created_at :updated_at :deleted_at))

(defn all []
  (map sanitize (organization-list-query)))

(defn create [org]
  (if-not (s/valid? :spacon.specs.organization/organization-spec org)
    (let [reason (s/explain-str :spacon.specs.organization/organization-spec org)
          err-msg (str "Failed to create new organization because" reason)]
      (log/error err-msg))
    (create-organization<! {:name (:name org)})))

(defn modify [id org]
  (if-not (s/valid? :spacon.specs.organization/organization-spec org)
    (let [reason (s/explain-str :spacon.specs.organization/organization-spec org)
          err-msg (str "Failed to update organization b/c" reason)]
      (log/error err-msg))
    (update-organization<! {:id id :name (:name org)})))

(defn find-by-id [id]
  (some-> (find-by-id-query {:id id})
          last))

(defn delete [id]
  (delete-organization! {:id id}))

(s/fdef all
        :args empty?
        :ret (s/coll-of :spacon.specs.organization/organization-spec))

(s/fdef find-by-id
        :args (s/cat :id (s/and int? pos?))
        :ret (s/spec :spacon.specs.organization/organization-spec))

(s/fdef create
        :args (s/cat :org (s/spec :spacon.specs.organization/organization-spec))
        :ret (s/spec :spacon.specs.organization/organization-spec))

(s/fdef modify
        :args (s/cat :id (s/and int? pos?)
                     :org (s/spec :spacon.specs.organization/organization-spec))
        :ret (s/spec :spacon.specs.organization/organization-spec))

(s/fdef delete
        :args (s/cat :id (s/and int? pos?)))
