(ns spacon.components.device
  (:require [com.stuartsierra.component :as component]
            [spacon.http.intercept :as intercept]
            [spacon.components.mqtt :as mqttapi]
            [yesql.core :refer [defqueries]]
            [spacon.models.devices :as devicemodel]
            [spacon.http.response :as response]))

(defn http-get [_]
  (let [d (devicemodel/all)]
    (response/ok d)))

(defn http-get-device [context]
  (if-let [id (get-in context [:path-params :id])]
    (response/ok (devicemodel/find-by-identifier id))
    (response/ok nil)))

(defn http-post-device [context]
  (if-let [d (devicemodel/create (:json-params context))]
    (response/ok d)
    (response/error "Error creating")))

(defn http-put-device [context]
  (if-let [d (devicemodel/update
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

(defn mqtt-register [message]
  (devicemodel/create (:payload message)))

(defrecord DeviceComponent [mqtt]
  component/Lifecycle
  (start [this]
    (assoc this :routes (routes)))
  (stop [this]
    this))

(defn make-device-component []
  (map->DeviceComponent {}))
