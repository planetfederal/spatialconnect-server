(ns mqtt-server.models.config
  (:require
    [yesql.core :refer [defqueries]]
    [mqtt-server.db :as db :refer [db-spec]]))

(defqueries "sql/config.sql"
            {:connection db-spec})

(defn count-configs []
  (-> (count-configs-query)
      (first)
      (get :cnt)))

(defn create-config [name]
  (create-config<! {:group_name name}))

(defn config-list []
  (config-list-query))

(defn find-by-id [id]
  (first (find-by-id-query {:id id})))

(defn find-by-name [name]
  (last (find-by-name-query {:group_name name})))

(defn update-config [id,name]
  (update-config-query<! {:group_name name :id id}))

(defn delete-config [id]
  (delete-config-query! {:id id}))