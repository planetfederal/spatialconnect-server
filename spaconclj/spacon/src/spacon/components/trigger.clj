(ns spacon.components.trigger
  (:require [com.stuartsierra.component :as component]
            [spacon.db.conn :as db]
            [spacon.util.db :as dbutil]
            [yesql.core :refer [defqueries]]
            [clojure.data.json :as json]
            [spacon.http.intercept :as intercept])
  (:import (org.postgresql.util PGobject)))

(defqueries "sql/trigger.sql"
            {:connection db/db-spec})

(defn entity->map [t]
  {:id (.toString (:id t))
   :created_at (.toString (:created_at t))
   :updated_at (.toString (:updated_at t))
   :definition (if-let [v (:definition t)]
                         (cond (string? v) (json/read-str (.getValue v))
                               (instance? org.postgresql.util.PGobject v) (json/read-str (.getValue v))
                                :else v))
   :recipients (:recipients t)})

(defn trigger-list []
  (map (fn [t]
         (entity->map t)) (trigger-list-query {} dbutil/result->map)))

(defn find-trigger [id]
  (some-> (find-by-id-query {:id (java.util.UUID/fromString id)} dbutil/result->map)
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

(defn http-get [context]
  (intercept/ok (trigger-list)))

(defn http-get-trigger [context]
  (if-let [d (find-trigger (get-in context [:path-params :id]))]
    (intercept/ok d)
    (intercept/error "Error retrieving")))

(defn http-put-trigger [context]
  (if-let [d (update-trigger (get-in context [:path-params :id])
                             (:json-params context))]
    (intercept/ok d)
    (intercept/error "Error updating ")))

(defn http-post-trigger [context]
  (if-let [d (create-trigger (:json-params context))]
    (intercept/ok d)
    (intercept/error "Error creating")))

(defn http-delete-trigger [context]
  (delete-trigger (get-in context [:path-params :id]))
  (intercept/ok "success"))

(defn- routes [] #{["/api/triggers" :get
                    (conj intercept/common-interceptors `http-get)]
                   ["/api/triggers/:id" :get
                    (conj intercept/common-interceptors `http-get-trigger)]
                   ["/api/triggers/:id" :put
                    (conj intercept/common-interceptors `http-put-trigger)]
                   ["/api/triggers" :post
                    (conj intercept/common-interceptors `http-post-trigger)]
                   ["/api/triggers/:id" :delete
                    (conj intercept/common-interceptors `http-delete-trigger)]})

(defrecord TriggerComponent [notify]
  component/Lifecycle
  (start [this]
    (assoc this :routes (routes)))
  (stop [this]
    this))

(defn make-trigger-component []
  (->TriggerComponent nil))
