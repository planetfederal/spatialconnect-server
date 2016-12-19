(ns spacon.components.store.db
  (:require [spacon.db.conn :as db]
            [spacon.util.db :as dbutil]
            [yesql.core :refer [defqueries]]
            [clojure.spec.gen :as gen]
            [clojure.data.json :as json]
            [clojure.spec :as s]
            [spacon.entity.store :refer :all]))

;; define sql queries as functions
(defqueries "sql/store.sql" {:connection db/db-spec})

(def uuid-regex #"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")

(defn- sanitize [store]
  (dissoc store :created_at :updated_at :deleted_at))

(defn map->entity [t]
  (-> t
      (cond-> (nil? (:options t)) (assoc :options nil))
      (cond-> (some? (:options t)) (assoc :options (json/write-str (:options t))))
      (assoc :default_layers (dbutil/->StringArray (:default_layers t)))))

(defn all
  "Lists all the active stores"
  []
  (map (fn [d]
         (map->StoreRecord (sanitize d))) (store-list-query {} dbutil/result->map)))

(defn find-by-id
  "Gets store by store identifier"
  [id]
  (if (re-matches uuid-regex id)
    (some-> (find-by-id-query {:id (java.util.UUID/fromString id)} dbutil/result->map)
            (first)
            (sanitize)
            map->StoreRecord)
    nil))

(defn create
  "Creates a store"
  [t]
  (if-let [new-store (insert-store<! (map->entity t))]
    (map->StoreRecord (sanitize (assoc t :id (.toString (:id new-store)))))
    nil))

(defn modify
  "Update a data store"
  [id t]
  (let [updated-store (update-store<! (map->entity (assoc t :id (java.util.UUID/fromString id))))]
    (map->StoreRecord (assoc t :id (.toString (:id updated-store))
                               :created_at (:created_at updated-store)
                               :updated_at (:updated_at updated-store)))))

(defn delete
  "Deactivates a store"
  [id]
  (delete-store! {:id (java.util.UUID/fromString id)}))

(s/fdef all
        :args empty?
        :ret (s/coll-of :spacon.spec/store-spec))

(s/fdef create
        :args (s/cat :t :spacon.spec/store-spec)
        :ret (s/or :spacon.spec/store-spec nil?))
