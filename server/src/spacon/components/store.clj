(ns spacon.components.store
  (:require [com.stuartsierra.component :as component]
            [spacon.http.intercept :as intercept]
            [spacon.http.response :as response]
            [spacon.models.store :as storemodel]))

(defn http-get [context]
  (if-let [d (storemodel/all)]
    (response/ok d)
    (response/error "Error")))

(defn http-get-error [context]
    (response/error "Error"))

(defn http-get-store [context]
  (if-let [d (storemodel/find-by-id (get-in context [:path-params :id]))]
    (response/ok d)
    (response/error "Error retrieving store")))

(defn http-put-store [context]
  (if-let [d (storemodel/update (get-in context [:path-params :id])
                                  (:json-params context))]
    (response/ok "success")
    (response/error "Error updating")))

(defn http-post-store [context]
  (if-let [d (storemodel/create (:json-params context))]
    (response/ok d)
    (response/error "Error creating")))

(defn http-delete-store [context]
  (storemodel/delete (get-in context [:path-params :id]))
  (response/ok "success"))

(defn- routes [] #{["/api/stores" :get
                    (conj intercept/common-interceptors `http-get)]
                   ["/api/stores-error" :get
                    (conj intercept/common-interceptors `http-get-error)]
                   ["/api/stores/:id" :get
                    (conj intercept/common-interceptors `http-get-store)]
                   ["/api/stores/:id" :put
                    (conj intercept/common-interceptors `http-put-store)]
                   ["/api/stores" :post
                    (conj intercept/common-interceptors `http-post-store)]
                   ["/api/stores/:id" :delete
                    (conj intercept/common-interceptors `http-delete-store)]})

(defrecord StoreComponent []
  component/Lifecycle
  (start [this]
    (assoc this :routes (routes)))
  (stop [this]
    this))

(defn make-store-component []
  (->StoreComponent))
