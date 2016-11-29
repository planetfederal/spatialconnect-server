(ns spacon.models.store
  (:require [spacon.db.conn :as db]
            [spacon.util.db :as dbutil]
            [yesql.core :refer [defqueries]]
            [clojure.spec.gen :as gen]
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

(defn sanitize [store]
  (dissoc store :created_at :updated_at :deleted_at))

(defn store-list[]
  (map (fn [d]
         (map->StoreRecord (sanitize d))) (store-list-query {} dbutil/result->map)))

(defn find-store [id]
  (if (re-matches uuid-regex id)
    (some-> (find-by-id-query {:id (java.util.UUID/fromString id)} dbutil/result->map)
            (first)
            (sanitize)
            map->StoreRecord)
    nil))

(defn create-store [t]
  (if-let [new-store (insert-store<! (assoc t :default_layers (dbutil/->StringArray (:default_layers t))))]
    (map->StoreRecord (sanitize (assoc t :id (.toString (:id new-store)))))
  nil))

(defn update-store [id t]
  (let [entity (assoc t :id (java.util.UUID/fromString id))
        updated-store (update-store<! (assoc entity :default_layers (dbutil/->StringArray (:default_layers t))))]
    (map->StoreRecord (assoc t :id (:id updated-store)
                                     :created_at (:created_at updated-store)
                                     :updated_at (:updated_at updated-store)))))

(defn delete-store [id]
  (delete-store! {:id (java.util.UUID/fromString id)}))

(s/fdef store-list
        :args empty?
        :ret (s/coll-of ::store-spec))

(s/fdef find-store
        :args (s/cat :id ::id)
        :ret (s/or ::store-spec nil?))

;(s/fdef create-store
;        :args (s/cat :t ::store-spec)
;        :ret (s/or ::store-spec nil?))