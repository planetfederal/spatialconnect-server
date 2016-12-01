(ns spacon.models.triggers
  (:require [spacon.db.conn :as db]
            [spacon.util.db :as dbutil]
            [clojure.spec :as s]
            [yesql.core :refer [defqueries]]
            [clojure.data.json :as json])
  (:import (org.postgresql.util PGobject)))

(defqueries "sql/trigger.sql"
            {:connection db/db-spec})

;;; specs about trigger data
(s/def ::name string?)
(s/def ::identifier string?)
(s/def ::device-info map?)
(s/def ::device-spec (s/keys :req-un [::name ::identifier ::device-info]))

(defn entity->map [t]
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

(defn row-fn [row]
    (-> row
      (assoc :stores (vec (.getArray (:stores row))))))

(def result->map
  {:result-set-fn doall
   :row-fn row-fn
   :identifiers clojure.string/lower-case})

(defn trigger-list []
  (map (fn [t]
         (entity->map t)) (trigger-list-query {} result->map)))

(defn find-trigger [id]
  (some-> (find-by-id-query {:id (java.util.UUID/fromString id)} result->map)
          (first)
          entity->map))

(defn map->entity [t]
  (-> t
      (cond-> (nil? (:rules t)) (assoc :rules nil))
      (cond-> (some? (:rules t)) (assoc :rules (json/write-str (:rules t))))
      (cond-> (nil? (:recipients t)) (assoc :recipients nil))
      (cond-> (some? (:recipients t)) (assoc :recipients (json/write-str (:recipients t))))
      (assoc :stores (dbutil/->StringArray (:stores t)))))

(defn create-trigger [t]
  (let [new-trigger (insert-trigger<! (map->entity t))]
    (entity->map (assoc t :id (:id new-trigger)
                          :created_at (:created_at new-trigger)
                          :updated_at (:updated_at new-trigger)))))

(defn update-trigger [id t]
  (let [updated-trigger (update-trigger<! (map->entity (assoc t :id (java.util.UUID/fromString id))))]
    (entity->map (assoc t :id (:id updated-trigger)
                          :created_at (:created_at updated-trigger)
                          :updated_at (:updated_at updated-trigger)))))

(defn delete-trigger [id]
  (delete-trigger! {:id (java.util.UUID/fromString id)}))

(defn sanitize [trigger]
  (dissoc trigger :created_at :updated_at :deleted_at))
