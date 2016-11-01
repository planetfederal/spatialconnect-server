(ns spacon.components.trigger
  (:require [com.stuartsierra.component :as component]
            [spacon.db.conn :as db]
            [yesql.core :refer [defqueries]]
            [clojure.data.json :as json]
            [spacon.http.intercept :as intercept]
            [ring.util.response :as ring-resp]))

(defqueries "sql/trigger.sql"
            {:connection db/db-spec})

(defn entity->map [t]
  {:id (.toString (:id t))
   :created_at (.toString (:created_at t))
   :updated_at (.toString (:updated_at t))
   :definition (if-let [v (:definition t)]
                         (json/read-str (.getValue v))
                         nil)
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

(defn create-trigger [t]
  (insert-trigger<! t))

(defn update-trigger [id t]
  (update-trigger<! t))

(defn delete-trigger [id]
  (delete-trigger! {:id id}))

(defn http-get [context]
  (ring-resp/response {:response (trigger-list)}))

(defn http-get-trigger [context]
  (ring-resp/response {:response (find-trigger (get-in context [:path-params :id]))}))

(defn http-put-trigger [context]
  (ring-resp/response {:response (update-trigger (get-in context [:path-params :id])
                                                 (:json-params context))}))

(defn http-post-trigger [context]
  (ring-resp/response {:response (create-trigger (:json-params context))}))

(defn http-delete-trigger [context]
  (ring-resp/response {:response (delete-trigger (get-in context [:path-params :id]))}))

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

(defrecord TriggerComponent []
  component/Lifecycle
  (start [this]
    (assoc this :routes (routes)))
  (stop [this]
    this))

(defn make-trigger-component []
  (->TriggerComponent))
