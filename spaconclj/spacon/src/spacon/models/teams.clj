(ns spacon.models.teams
  (:require [spacon.db.conn :as db]
            [clojure.spec :as s]
            [clojure.spec.gen :as gen]
            [clojure.set :refer [rename-keys]]
            [spacon.models.organizations :as orgsmodel]
            [yesql.core :refer [defqueries]])
  (:import (org.postgresql.util PGobject)))

;;; specs for teams
(s/def :team/name string?)
(s/def :team/organization-id
  (s/with-gen (s/and int? pos?)
    #(s/gen (set (map :id (orgsmodel/all))))))
(s/def ::team-spec (s/keys :req-un
                           [:team/name :team/organization-id]))
(defqueries "sql/team.sql"
  {:connection db/db-spec})

(defn- sanitize [team]
  (let [mteam (rename-keys team {:organization_id :organization-id})]
    (dissoc mteam :created_at :updated_at :deleted_at)))

(defn all []
  (map sanitize (team-list-query)))

(defn create [team]
  (if-not (s/valid? ::team-spec team)
    (s/explain-str ::team-spec team)
    (sanitize (insert-team<! {:name (:name team)
                     :organizationid (:organization-id team)}))))

(defn modify [id team]
  (if-not (s/valid? ::team-spec team)
    (s/explain-str ::team-spec team)
    (sanitize (update-team<! {:id id :name (:name team)}))))

(defn find-by-id [id]
  (sanitize (find-by-id-query {:id id})))

(defn delete [id]
  (delete-team! {:id id}))

(s/fdef all
        :args empty?
        :ret (s/coll-of ::team-spec))

(s/fdef find-by-id
        :args (s/cat :id (s/and int? pos?))
        :ret (s/spec ::team-spec))

(s/fdef create
        :args (s/cat :team (s/spec ::team-spec))
        :ret (s/spec ::team-spec))

(s/fdef modify
        :args (s/cat :id (s/and int? pos?)
                     :team (s/spec ::team-spec)))

(s/fdef delete
        :args (s/cat :id (s/and int? pos?)))
