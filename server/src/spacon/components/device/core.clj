(ns spacon.components.device.core
  (:require [com.stuartsierra.component :as component]
            [spacon.http.intercept :as intercept]
            [yesql.core :refer [defqueries]]
            [spacon.components.device.db :as devicemodel]
            [spacon.http.response :as response]
            [camel-snake-kebab.core :refer :all]
            [camel-snake-kebab.extras :refer [transform-keys]]))

(defn http-get [_]
  (let [d (devicemodel/all)]
    (response/ok d)))

(defn http-get-device [context]
  (if-let [id (get-in context [:path-params :id])]
    (response/ok (devicemodel/find-by-identifier id))
    (response/ok nil)))

(defn http-post-device [context]
  (if-let [d (devicemodel/create (transform-keys ->kebab-case-keyword (:json-params context)))]
    (response/ok d)
    (response/error "Error creating")))

(defn http-put-device [context]
  (if-let [d (devicemodel/modify
              (get-in context [:path-params :id])
              (:json-params context))]
    (response/ok d)
    (response/error "Error updating")))

(defn http-delete-device [context]
  (devicemodel/delete (get-in context [:path-params :id]))
  (response/ok "success"))

(defn- routes [] #{["/api/devices" :get
                    (conj intercept/common-interceptors `http-get)]
                   ["/api/devices/:id" :get
                    (conj intercept/common-interceptors `http-get-device)]
                   ["/api/devices/:id" :put
                    (conj intercept/common-interceptors `http-put-device)]
                   ["/api/devices" :post
                    (conj intercept/common-interceptors `http-post-device)]
                   ["/api/devices/:id" :delete
                    (conj intercept/common-interceptors `http-delete-device)]})

(defrecord DeviceComponent [mqtt]
  component/Lifecycle
  (start [this]
    (assoc this :routes (routes)))
  (stop [this]
    this))

(defn make-device-component []
  (map->DeviceComponent {}))
