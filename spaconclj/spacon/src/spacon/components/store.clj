(ns spacon.components.store
  (:require [com.stuartsierra.component :as component]
            [spacon.http.intercept :as intercept]
            [spacon.models.store :as store]))

(defn http-get [context]
  (if-let [d (store/store-list)]
    (intercept/ok d)
    (intercept/error "Error")))

(defn http-get-store [context]
  (if-let [d (store/find-store (get-in context [:path-params :id]))]
    (intercept/ok d)
    (intercept/error "Error retrieving store")))

(defn http-put-store [context]
  (if-let [d (store/update-store (get-in context [:path-params :id])
                                  (:json-params context))]
    (intercept/ok "success")
    (intercept/error "Error updating")))

(defn http-post-store [context]
  (if-let [d (store/create-store (:json-params context))]
    (intercept/ok d)
    (intercept/error "Error creating")))

(defn http-delete-store [context]
  (store/delete-store (get-in context [:path-params :id]))
  (intercept/ok "success"))

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
