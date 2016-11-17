(ns spacon.components.device
  (:require [com.stuartsierra.component :as component]
            [spacon.http.intercept :as intercept]
            [ring.util.response :as ring-resp]
            [yesql.core :refer [defqueries]]
            [spacon.models.devices :as model]))

(defn http-get [_]
  (let [d (model/device-list)]
    (ring-resp/response {:response d})))

(defn http-get-device [context]
  (if-let [id (get-in context [:path-params :id])]
    (ring-resp/response {:response (model/find-device id)})
    (ring-resp/response {:response nil})))

(defn http-post-device [context]
  (if-let [d (model/create-device (:json-params context))]
    (ring-resp/response {:response d})
    (ring-resp/response {:response "Error creating"})))

(defn http-put-device [context]
  (if-let [d (model/update-device
               (get-in context [:path-params :id])
               (:json-params context))]
    (ring-resp/response {:response d})
    (ring-resp/response {:response "Error updating"})))

(defn http-delete-device [context]
  (model/delete-device (get-in context [:path-params :id]))
  (ring-resp/response {:response "success"}))

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

(defrecord DeviceComponent []
  component/Lifecycle
  (start [this]
    (assoc this :routes (routes)))
  (stop [this]
    this))

(defn make-device-component []
  (->DeviceComponent))
