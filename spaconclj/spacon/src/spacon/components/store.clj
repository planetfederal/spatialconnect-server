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
     :default_layers  (:default_layers entity)}))

(defn store-list[]
  (map (fn [d]
         (entity->map d)) (store-list-query)))

(defn http-get [context]
  (let [d (store-list)]
    (ring-resp/response {:response d})))

(defn- routes [] #{["/api/stores" :get
                    (conj intercept/common-interceptors `http-get)]
                  })

(defrecord StoreComponent []
  component/Lifecycle
  (start [this]
    (assoc this :routes (routes)))
  (stop [this]
    this))

(defn make-store-component []
  (->StoreComponent))
