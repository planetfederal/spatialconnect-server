(ns spacon.components.user.db
  (:require [spacon.db.conn :as db]
            [yesql.core :refer [defqueries]]
            [clojure.java.jdbc :as jdbc]
            [buddy.hashers :as hashers]
            [clojure.tools.logging :as log]))

;; define sql queries as functions in this namespace
(defqueries "sql/user.sql" {:connection db/db-spec})

(defn- sanitize
  "Cleans up fields from the database"
  [user]
  (dissoc user :password :created_at :updated_at :deleted_at))

(defn all
  []
  (log/debug "Fetching all users from db")
  (map sanitize (find-all)))

(defn create-user-with-team
  "Adds a new user to the database and updates join table with the team.
   Returns the user with id."
  [u team-id]
  (log/debug "Inserting user %s with team id %d" u team-id)
  (jdbc/with-db-transaction [tx db/db-spec]
    (let [user-info {:name     (:name u)
                     :email    (:email u)
                     :password (hashers/derive (:password u))}
          tnx       {:connection tx}
          new-user  (create<! user-info tnx)
          user-id   (:id new-user)]
      (add-team<! {:user_id user-id :team_id team-id} tnx)
      new-user)))

(defn create
  "Adds a new user to the database.
   Returns the user with id."
  [u]
  (log/debug "Inserting user" u)
  (let [user-info {:name     (:name u)
                   :email    (:email u)
                   :password (hashers/derive (:password u))}]
    (sanitize (create<! user-info))))

(defn add-user-team [user-team]
  (log/debug "Adding user %s to team %s" (:userId user-team)  (:teamId user-team))
  (if-let [new-user-team (add-team<! {:user_id (:userId user-team) :team_id (:teamId user-team)})]
    (sanitize new-user-team)
    nil))

(defn remove-user-team [user-team]
  (log/debug "Removing user %s from team %s" (:userId user-team)  (:teamId user-team))
  (if-let [new-user-team (remove-team<! {:user_id (:userId user-team) :team_id (:teamId user-team)})]
    (sanitize new-user-team)
    nil))
