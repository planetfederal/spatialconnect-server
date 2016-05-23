(ns mqtt-server.models.devices
  (:require
    [yesql.core :refer [defqueries]]
    [mqtt-server.db :as db :refer [db-spec]]))

(defqueries "sql/device.sql"
            {:connection db-spec})

(defn count-devices []
  (-> (count-devices-query)
      (first)
      (get :cnt)))

(defn device-list []
  (device-list-query))

(defn create-device [dev]
  (let [name (get dev :name)
        ident (get dev :identifier)]
    (create-device<! {:name name
                      :identifier ident})))

(defn find-by-id [id]
  (last (find-by-id-query {:id id})))

(defn find-by-name [name]
  (last (find-by-name-query {:name name})))

(defn update-device [d]
  (update-device<! {:name (get d :name)
                   :id (get d :id)}))

(defn delete-device [id]
  (delete-device! {:id id}))