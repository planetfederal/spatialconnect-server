(ns spacon.components.team.db
  (:require [spacon.db.conn :as db]
            [clojure.spec :as s]
            [spacon.specs.team]
            [clojure.set :refer [rename-keys]]
            [spacon.components.organization.db :as orgsmodel]
            [yesql.core :refer [defqueries]])
  (:import (org.postgresql.util PGobject)))

(defqueries "sql/team.sql"
  {:connection db/db-spec})

(defn- sanitize [team]
  (let [mteam (rename-keys team {:organization_id :organization-id})]
    (dissoc mteam :created_at :updated_at :deleted_at)))

(defn all []
  (map sanitize (team-list-query)))

(defn create [team]
  (if-let [new-team (insert-team<! (rename-keys team {:organization-id :organization_id}))]
    (sanitize new-team)
    nil))

(defn modify [id team]
  (if-not (s/valid? :spacon.specs.team/team-spec team)
    (s/explain-str :spacon.specs.team/team-spec team)
    (sanitize (update-team<! {:id id :name (:name team)}))))

(defn find-by-id [id]
  (sanitize (first (find-by-id-query {:id (Integer/parseInt id)}))))

(defn delete [id]
  (delete-team! {:id (Integer/parseInt id)})
  (delete-user-team! {:id (Integer/parseInt id)}))

(s/fdef all
        :args empty?
        :ret (s/coll-of :spacon.specs.team/team-spec))

(s/fdef find-by-id
        :args (s/cat :id (s/and int? pos?))
        :ret (s/spec :spacon.specs.team/team-spec))

(s/fdef create
        :args (s/cat :team (s/spec :spacon.specs.team/team-spec))
        :ret (s/spec :spacon.specs.team/team-spec))

(s/fdef modify
        :args (s/cat :id (s/and int? pos?)
                     :team (s/spec :spacon.specs.team/team-spec)))

(s/fdef delete
        :args (s/cat :id (s/and int? pos?)))
