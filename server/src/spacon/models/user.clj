(ns spacon.models.user
  (:require [spacon.db.conn :as db]
            [yesql.core :refer [defqueries]]
            [clojure.spec :as s]
            [clojure.java.jdbc :as jdbc]
            [buddy.hashers :as hashers]))

;; define sql queries as functions
(defqueries "sql/user.sql" {:connection db/db-spec})

(defn- sanitize [user]
  "Cleans up fields from the database"
  (dissoc user :password :created_at :updated_at :deleted_at))

(defn all []
  (map sanitize (find-all)))

(defn create-user-with-team
  "Adds a new user to the database and updates join table with the team.
   Returns the user with id."
  [u team-id]
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
  (let [user-info {:name     (:name u)
                   :email    (:email u)
                   :password (hashers/derive (:password u))}]
    (sanitize (create<! user-info))))
