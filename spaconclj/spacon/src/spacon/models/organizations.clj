(ns spacon.models.organizations
  (:require [clojure.spec :as s]
            [spacon.spec :as specs]
            [spacon.db.conn :as db]
            [clojure.set :refer [rename-keys]]
            [yesql.core :refer [defqueries]]))

(defqueries "sql/organization.sql"
  {:connection db/db-spec})

(defn sanitize [org]
  (dissoc org :created_at :updated_at :deleted_at))

(defn all []
  (map sanitize (organization-list-query)))

(defn create [org]
  (if-not (s/valid? :spacon.spec/organization-spec org)
    (s/explain-str :spacon.spec/organization-spec org)
    (create-organization<! {:name (:name org)})))

(defn modify [id org]
  (if-not (s/valid? :spacon.spec/organization-spec org)
    (s/explain-str :spacon.spec/organization-spec org)
    (update-organization<! {:id id :name (:name org)})))

(defn find-by-id [id]
  (some-> (find-by-id-query {:id id})
          last))

(defn delete [id]
  (delete-organization! {:id id}))

(s/fdef all
        :args empty?
        :ret (s/coll-of :spacon.spec/organization-spec))

(s/fdef find-by-id
        :args (s/cat :id (s/and int? pos?))
        :ret (s/spec :spacon.spec/organization-spec))

(s/fdef create
        :args (s/cat :org (s/spec :spacon.spec/organization-spec))
        :ret (s/spec :spacon.spec/organization-spec))

(s/fdef modify
        :args (s/cat :id (s/and int? pos?)
                     :org (s/spec :spacon.spec/organization-spec))
        :ret (s/spec :spacon.spec/organization-spec))

(s/fdef delete
        :args (s/cat :id (s/and int? pos?)))
