(ns spacon.components.store
  (:require [com.stuartsierra.component :as component]
            [spacon.http.intercept :as intercept]
            [ring.util.response :as ring-resp]
            [spacon.db.conn :as db]
            [yesql.core :refer [defqueries]]
            [clojure.spec :as s]))


(defqueries "sql/store.sql" {:connection db/db-spec})

(defn entity->map [entity]
  (if (nil? entity)
    {}
    {:id              (:id entity)
     :store_type      (:store_type entity)
     :uri             (:uri entity)
     :version         (:version entity)
     :name            (:name entity)
     :team_id         (:team_id entity)
     :default_layers  (:default_layers entity)}))

(defn row-fn [row]
  (if-let [r (:default_layers row)]
    (assoc row :default_layers (vec (.getArray r)))
    row))

(def result->map
  {:result-set-fn doall
   :row-fn row-fn
   :identifiers clojure.string/lower-case})

(deftype StringArray [items]
  clojure.java.jdbc/ISQLParameter
  (set-parameter [_ stmt ix]
    (let [as-array (into-array Object items)
          jdbc-array (.createArrayOf (.getConnection stmt) "text" as-array)]
      (.setArray stmt ix jdbc-array))))

(defn store-list[]
  (map (fn [d]
         (entity->map d)) (store-list-query {} result->map)))

(defn find-store [id]
  (some-> (find-by-id-query {:id (java.util.UUID/fromString id)} result->map)
          (first)
          entity->map))

(defn create-store [t]
  (let [new-store (insert-store<! (assoc t :default_layers (->StringArray (:default_layers t))))]
    (entity->map (assoc t :id (:id new-store)
                          :created_at (:created_at new-store)
                          :updated_at (:updated_at new-store)))))

(defn update-store [id t]
  (let [entity (assoc t :id (java.util.UUID/fromString id))
        updated-store (update-store<! (assoc entity :default_layers (->StringArray (:default_layers t))))]
    (entity->map (assoc t :id (:id updated-store)
                          :created_at (:created_at updated-store)
                          :updated_at (:updated_at updated-store)))))

(defn delete-store [id]
  (delete-store! {:id (java.util.UUID/fromString id)}))

(defn http-get [context]
  (let [d (store-list)]
    (ring-resp/response {:response d})))

(defn http-get-store [context]
  (ring-resp/response {:response (find-store (get-in context [:path-params :id]))}))

(defn http-put-store [context]
  (ring-resp/response {:response (update-store (get-in context [:path-params :id])
                                                 (:json-params context))}))

(defn http-post-store [context]
  (ring-resp/response {:response (create-store (:json-params context))}))

(defn http-delete-store [context]
  (delete-store (get-in context [:path-params :id]))
  (ring-resp/response {:response "success"}))


(defn- routes [] #{["/api/stores" :get
                    (conj intercept/common-interceptors `http-get)]
                   ["/api/stores/:id" :get
                    (conj intercept/common-interceptors `http-get-store)]
                   ["/api/stores/:id" :put
                    (conj intercept/common-interceptors `http-put-store)]
                   ["/api/stores" :post
                    (conj intercept/common-interceptors `http-post-store)]
                   ["/api/stores/:id" :delete
                    (conj intercept/common-interceptors `http-delete-store)]
                  })

(defrecord StoreComponent []
  component/Lifecycle
  (start [this]
    (assoc this :routes (routes)))
  (stop [this]
    this))

(defn make-store-component []
  (->StoreComponent))
