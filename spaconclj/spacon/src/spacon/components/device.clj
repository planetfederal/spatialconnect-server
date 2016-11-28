(ns spacon.components.device
  (:require [com.stuartsierra.component :as component]
            [spacon.http.intercept :as intercept]
            [spacon.components.mqtt :as mqttapi]
            [yesql.core :refer [defqueries]]
            [spacon.models.devices :as model]
            [spacon.http.response :as response]))

(defn http-get [_]
  (let [d (model/device-list)]
    (response/ok d)))

(defn http-get-device [context]
  (if-let [id (get-in context [:path-params :id])]
    (response/ok (model/find-device id))
    (response/ok nil)))

(defn http-post-device [context]
  (if-let [d (model/create-device (:json-params context))]
    (response/ok d)
    (response/error "Error creating")))

(defn http-put-device [context]
  (if-let [d (model/update-device
               (get-in context [:path-params :id])
               (:json-params context))]
    (response/ok d)
    (response/error "Error updating")))

(defn http-delete-device [context]
  (model/delete-device (get-in context [:path-params :id]))
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
  (model/create-device (:payload message)))

(defrecord DeviceComponent [mqtt]
  component/Lifecycle
  (start [this]
    ;(mqttapi/subscribe mqtt "/config/register" (partial mqtt-register mqtt))
    (assoc this :routes (routes)))
  (stop [this]
    this))

(defn make-device-component []
  (map->DeviceComponent {}))
