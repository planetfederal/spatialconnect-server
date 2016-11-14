(ns spacon.models.store
  (:require [spacon.db.conn :as db]
            [spacon.util.db :as dbutil]
            [yesql.core :refer [defqueries]]
            [clojure.spec :as s]))

;; define sql queries as functions
(defqueries "sql/store.sql" {:connection db/db-spec})

;; define specs about store
(s/def ::store_type string?)
(s/def ::version string?)
(s/def ::uri string?)
(s/def ::name string?)
(s/def ::team_id integer?)
(s/def ::default_layers (s/coll-of string?))
(s/def ::spec (s/keys :req-un [::name ::store_type ::team_id ::version ::uri ::default_layers]))

(defrecord StoreRecord [id store_type uri version name team_id default_layers])

(defn row-fn [row]
  (if-let [r (:default_layers row)]
    (assoc row :default_layers (vec (.getArray r)))
    row))

(def result->map
  {:result-set-fn doall
   :row-fn row-fn
   :identifiers clojure.string/lower-case})

(defn sanitize [store]
  (let [string-id  (.toString (:id store))
        santized-store (dissoc store :created_at :updated_at :deleted_at)]
    (assoc santized-store :id string-id)))

(defn store-list[]
  (map (fn [d]
         (map->StoreRecord (sanitize d))) (store-list-query {} result->map)))

(defn find-store [id]
  (some-> (find-by-id-query {:id (java.util.UUID/fromString id)} result->map)
          (first)
          (sanitize)
          map->StoreRecord))

(defn create-store [t]
  (let [new-store (insert-store<! (assoc t :default_layers (dbutil/->StringArray (:default_layers t))))]
    (map->StoreRecord (assoc t :id (:id new-store)
                                     :created_at (:created_at new-store)
                                     :updated_at (:updated_at new-store)))))

(defn update-store [id t]
  (let [entity (assoc t :id (java.util.UUID/fromString id))
        updated-store (update-store<! (assoc entity :default_layers (dbutil/->StringArray (:default_layers t))))]
    (map->StoreRecord (assoc t :id (:id updated-store)
                                     :created_at (:created_at updated-store)
                                     :updated_at (:updated_at updated-store)))))

(defn delete-store [id]
  (delete-store! {:id (java.util.UUID/fromString id)}))