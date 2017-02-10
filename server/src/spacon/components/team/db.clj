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

(ns spacon.components.team.db
  (:require [spacon.db.conn :as db]
            [clojure.spec :as s]
            [spacon.specs.team]
            [clojure.set :refer [rename-keys]]
            [spacon.components.organization.db :as orgsmodel]
            [yesql.core :refer [defqueries]]
            [clojure.tools.logging :as log])
  (:import (org.postgresql.util PGobject)))

;; define sql queries as functions in this namespace
(defqueries "sql/team.sql" {:connection db/db-spec})

(defn- sanitize [team]
  (let [mteam (rename-keys team {:organization_id :organization-id})]
    (dissoc mteam :created_at :updated_at :deleted_at)))

(defn all []
  (log/debug "Fetching all teams from db")
  (map sanitize (team-list-query)))

(defn create [team]
  (log/debug "Inserting new team into db" team)
  (if-let [new-team (insert-team<! (rename-keys team {:organization-id :organization_id}))]
    (sanitize new-team)
    nil))

(defn modify [id team]
  (log/debugf "Updating team id %s with %s" id team)
  (if-not (s/valid? :spacon.specs.team/team-spec team)
    (let [reason (s/explain-str :spacon.specs.team/team-spec team)
          err-msg (str "Failed to update team because" reason)]
      (log/error err-msg))
    (sanitize (update-team<! {:id id :name (:name team)}))))

(defn find-by-id [id]
  (log/debug "Finding team with id" id)
  (sanitize (first (find-by-id-query {:id (Integer/parseInt id)}))))

(defn delete [id]
  (log/debug "Deleting team with id" id)
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
