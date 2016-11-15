(ns spacon.components.store
  (:require [com.stuartsierra.component :as component]
            [spacon.http.intercept :as intercept]
            [ring.util.response :as ring-resp]
            [spacon.models.store :as store]))

(defn http-get [context]
  (let [d (store/store-list)]
    (ring-resp/response {:response d})))

(defn http-get-store [context]
  (ring-resp/response {:response (store/find-store (get-in context [:path-params :id]))}))

(defn http-put-store [context]
  (ring-resp/response {:response (store/update-store (get-in context [:path-params :id])
                                                 (:json-params context))}))

(defn http-post-store [context]
  (ring-resp/response {:response (store/create-store (:json-params context))}))

(defn http-delete-store [context]
  (store/delete-store (get-in context [:path-params :id]))
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
