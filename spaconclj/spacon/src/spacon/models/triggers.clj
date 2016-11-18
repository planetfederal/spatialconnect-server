(ns spacon.models.triggers
  (:require [spacon.db.conn :as db]
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
  {:id (.toString (:id t))
   :created_at (.toString (:created_at t))
   :updated_at (.toString (:updated_at t))
   :definition (if-let [v (:definition t)]
                 (cond (string? v) (json/read-str (.getValue v))
                       (instance? org.postgresql.util.PGobject v) (json/read-str (.getValue v))
                       :else v))
   :recipients (:recipients t)})

(defn row-fn [row]
  (if-let [r (:recipients row)]
    (assoc row :recipients (vec (.getArray r)))
    row))

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
  (if (nil? (:definition t))
    t
    (assoc t :definition (json/write-str (:definition t)))))

(deftype StringArray [items]
  clojure.java.jdbc/ISQLParameter
  (set-parameter [_ stmt ix]
    (let [as-array (into-array Object items)
          jdbc-array (.createArrayOf (.getConnection stmt) "text" as-array)]
      (.setArray stmt ix jdbc-array))))

(defn create-trigger [t]
  (let [entity (map->entity t)
        new-trigger (insert-trigger<! (assoc entity :recipients (->StringArray (:recipients t))))]
    (entity->map (assoc t :id (:id new-trigger)
                          :created_at (:created_at new-trigger)
                          :updated_at (:updated_at new-trigger)))))

(defn update-trigger [id t]
  (let [entity (map->entity (assoc t :id (java.util.UUID/fromString id)))
        updated-trigger (update-trigger<! (assoc entity :recipients (->StringArray (:recipients t))))]
    (entity->map (assoc t :id (:id updated-trigger)
                          :created_at (:created_at updated-trigger)
                          :updated_at (:updated_at updated-trigger)))))

(defn delete-trigger [id]
  (delete-trigger! {:id (java.util.UUID/fromString id)}))

(defn sanitize [trigger]
  (dissoc trigger :created_at :updated_at :deleted_at))