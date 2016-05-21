(ns mqtt-server.models.users
  (:use uuid.core)
  (:require
    [yesql.core :refer [defqueries]]
    [mqtt-server.db :as db :refer [db-spec]]
    [crypto.password.bcrypt :as password]))

(defqueries "sql/user.sql"
            {:connection db-spec})

(defn find-by-id-withpass [id]
  (some-> (find-by-id-query {:id id})
          (last)))

(defn find-by-id [id]
  (some-> (find-by-id-withpass id)
          (dissoc :password)))

(defn find-by-email [email]
  (some-> (find-by-email-query {:email email})
          (last)
          (dissoc :password)))

(defn- find-by-email-withpass [email]
  (some-> (find-by-email-query {:email email})
          (last)))

(defn create-user [u]
  (dissoc (create-user<! {:name (get u :name)
                          :email (get u :email)
                          :password (password/encrypt (get u :password))
                          :level (get u :level)})
          :password))



(defn delete-user [id]
  (delete-user! {:id id}))

(defn check-password? [email password]
  (some-> (find-by-email-withpass email)
          :password
          (->> (password/check password))))

(defn insert-token [token]
  (upsert-token! token ))

(defn select-token [id]
  (select-token-query {:id id}))