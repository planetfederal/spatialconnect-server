(ns spacon.components.organization.db
  (:require [clojure.spec :as s]
            [spacon.specs.organization :as specs]
            [spacon.db.conn :as db]
            [clojure.set :refer [rename-keys]]
            [yesql.core :refer [defqueries]]))

;; define sql queries as functions in this namespace
(defqueries "sql/organization.sql" {:connection db/db-spec})

(defn sanitize [org]
  (dissoc org :created_at :updated_at :deleted_at))

(defn all []
  (map sanitize (organization-list-query)))

(defn create [org]
  (if-not (s/valid? :spacon.specs.organization/organization-spec org)
    (s/explain-str :spacon.specs.organization/organization-spec org)
    (create-organization<! {:name (:name org)})))

(defn modify [id org]
  (if-not (s/valid? :spacon.specs.organization/organization-spec org)
    (s/explain-str :spacon.specs.organization/organization-spec org)
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
