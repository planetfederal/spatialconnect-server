(ns spacon.components.store
  (:require [com.stuartsierra.component :as component]
            [spacon.http.intercept :as intercept]
            [spacon.http.response :as response]
            [spacon.models.store :as store]))

(defn http-get [context]
  (if-let [d (store/store-list)]
    (response/success d)
    (response/error "Error")))

(defn http-get-error [context]
    (response/error "Error"))

(defn http-get-store [context]
  (if-let [d (store/find-store (get-in context [:path-params :id]))]
    (response/success d)
    (response/error "Error retrieving store")))

(defn http-put-store [context]
  (if-let [d (store/update-store (get-in context [:path-params :id])
                                  (:json-params context))]
    (response/success "success")
    (response/error "Error updating")))

(defn http-post-store [context]
  (if-let [d (store/create-store (:json-params context))]
    (response/success d)
    (response/error "Error creating")))

(defn http-delete-store [context]
  (store/delete-store (get-in context [:path-params :id]))
  (response/success "success"))

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
