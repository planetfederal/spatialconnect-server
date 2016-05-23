(ns mqtt-server.models.stores
  (:use uuid.core)
  (:require
    [yesql.core :refer [defqueries]]
    [mqtt-server.db :as db :refer [db-spec]]))

(defqueries "sql/store.sql"
            {:connection db-spec})

(defn countstores []
  (some-> (stores-count)
      (first)
      (get :cnt)))

(defn create-store [data]
    (create-store<! {:store_type (get data :store_type)
                     :version (get data :version)
                     :uri (get data :uri)
                     :name (get data :name)
                     :config_id (get data :config_id)}))

(defn store-list []
  (stores-query))

(defn store-by-id [id]
  (some-> (store-by-id-query {:id id})
          (last)))

(defn store-by-name [name]
  (some-> (store-by-name-query {:name name})
          (last)))

(defn update-store [s]
  (update-store<! {:id (uuid (get s :id))
                   :store_type (get s :store_type)
                   :version (get s :version)
                   :uri (get s :uri)
                   :name (get s :name)
                   :config_id (get s :config_id)}))


(defn delete-store [id]
  (delete-store! {:id id}))