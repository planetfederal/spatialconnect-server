(ns spacon.models.store
  (:require [spacon.db.conn :as db]
            [spacon.util.db :as dbutil]
            [yesql.core :refer [defqueries]]
            [clojure.spec.gen :as gen]
            [clojure.data.json :as json]
            [clojure.spec :as s]))

;; define sql queries as functions
(defqueries "sql/store.sql" {:connection db/db-spec})

(defn uuid-string-gen []
  (->>
   (gen/uuid)
   (gen/fmap #(.toString %))))

;; define specs about store
(def uuid-regex #"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")
(s/def ::id (s/with-gen
              (s/and string? #(re-matches uuid-regex %))
              #(uuid-string-gen)))
(s/def ::store_type string?)
(s/def ::version string?)
(s/def ::uri string?)
(s/def ::name string?)
(s/def ::team_id (s/and int? pos?))
(s/def ::default_layers (s/coll-of string?))
(s/def ::store-spec (s/keys :req-un [::name ::store_type ::team_id ::version ::uri ::default_layers]))

(defrecord StoreRecord [id store_type uri version name team_id default_layers])

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

(defn update
  "Update a data store"
  [id t]
  (let [updated-store (update-store<! (map->entity (assoc t :id (java.util.UUID/fromString id))))]
    (map->StoreRecord (assoc t :id (:id updated-store)
                             :created_at (:created_at updated-store)
                             :updated_at (:updated_at updated-store)))))

(defn delete
  "Deactivates a store"
  [id]
  (delete-store! {:id (java.util.UUID/fromString id)}))

(s/fdef all
        :args empty?
        :ret (s/coll-of ::store-spec))

(s/fdef find-by-id
        :args (s/cat :id ::id)
        :ret (s/or ::store-spec nil?))

(s/fdef create-store
        :args (s/cat :t ::store-spec)
        :ret (s/or ::store-spec nil?))
