(ns spacon.models.triggers
  (:require [spacon.db.conn :as db]
            [spacon.util.db :as dbutil]
            [clojure.spec :as s]
            [yesql.core :refer [defqueries]]
            [clojure.data.json :as json]
            [spacon.util.db :as dbutil])
  (:import (org.postgresql.util PGobject)))

(defqueries "sql/trigger.sql"
  {:connection db/db-spec})

(defn- sanitize [trigger]
  (dissoc trigger :created_at :updated_at :deleted_at))

(defn- entity->map [t]
  (-> t
      (assoc :id (.toString (:id t)))
      (assoc :created_at (.toString (:created_at t)))
      (assoc :updated_at (.toString (:updated_at t)))
      (assoc :rules (:rules t))
      (assoc :recipients (:recipients t))
      (assoc :stores (if-let [v (:stores t)]
                       (cond (string? v) (json/read-str (.getValue v))
                             (instance? org.postgresql.util.PGobject v) (json/read-str (.getValue v))
                             :else v)))))

(defn- row-fn
  "Modifies the row result while the ResultSet is open. This method
  is required for accessing methods that are only available while the
  PG ResultSet is open"
  [row]
  (-> row
      (assoc :stores (vec (.getArray (:stores row))))))

(def result->map
  {:result-set-fn doall
   :row-fn row-fn
   :identifiers clojure.string/lower-case})

(defn all
  "Returns all the active triggers"
  []
  (map (fn [t]
         (entity->map t)) (trigger-list-query {} result->map)))

(defn find-by-id
  "Find trigger by identifier"
  [id]
  (some-> (find-by-id-query {:id (java.util.UUID/fromString id)} result->map)
          (first)
          entity->map))

(defn map->entity
  "Converts input map to prepare for database insertion"
  [t]
  (cond-> t
    (some? (:rules t))
    (assoc :rules (json/write-str (:rules t)))
    (some? (:recipients t))
    (assoc :recipients (json/write-str (:recipients t)))))

(defn create
  "Creates a trigger definition"
  [t]
  {:pre [(s/valid? :spacon.spec/trigger-spec t)]}
  (let [entity (map->entity t)
        new-trigger (insert-trigger<!
                     (assoc entity
                            :stores (dbutil/->StringArray (:stores t))))]
    (entity->map (assoc t :id (:id new-trigger)
                        :created_at (:created_at new-trigger)
                        :updated_at (:updated_at new-trigger)))))

(defn modify
  "Update trigger"
  [id t]
  (let [entity (map->entity (assoc t :id (java.util.UUID/fromString id)))
        updated-trigger (update-trigger<!
                         (assoc entity
                                :recipients
                                (dbutil/->StringArray (:recipients t))
                                :stores
                                (dbutil/->StringArray (:stores t))))]
    (entity->map (assoc t :id (:id updated-trigger)
                        :created_at (:created_at updated-trigger)
                        :updated_at (:updated_at updated-trigger)))))
(defn delete
  "Delete trigger"
  [id]
  (delete-trigger! {:id (java.util.UUID/fromString id)}))

(s/fdef find-by-id
        :args (s/cat :id (s/and int? pos?))
        :ret (s/spec :spacon.spec/trigger-spec))

(s/fdef all
        :args empty?
        :ret (s/coll-of :spacon.spec/trigger-spec))

(s/fdef create
        :args (s/cat :trigger (s/spec :spacon.spec/trigger-spec))
        :ret (s/spec :spacon.spec/trigger-spec))

(s/fdef modify
        :args (s/cat :id (s/and int? pos?)
                     :t (s/spec :spacon.spec/trigger-spec))
        :ret (s/spec :spacon.spec/trigger-spec))

(s/fdef delete
        :args (s/cat :id (s/and int? pos?)))
