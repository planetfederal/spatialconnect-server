(ns spacon.components.config
  (:require [com.stuartsierra.component :as component]
            [spacon.http.intercept :as intercept]
            [spacon.http.response :as response]
            [spacon.models.store :as storemodel]
            [spacon.models.form :as formmodel]
            [spacon.models.devices :as devicemodel]
            [spacon.components.mqtt :as mqttapi]
            [spacon.models.form :as formmodel]))

(defn create-config []
  {:stores (storemodel/store-list)
   :forms  (formmodel/forms-list)})

(defn http-get [context]
  (let [d (create-config)]
    (response/ok d)))

(defn- routes [] #{["/api/config" :get
                    (conj intercept/common-interceptors `http-get)]})


(defn mqtt->config [mqtt message]
  (let [topic (:reply-to message)
        cfg (create-config)]
    (mqttapi/publish-scmessage mqtt topic (assoc message :payload cfg))))

(defn mqtt->register [message]
  (let [device (:payload message)]
    (devicemodel/create-device device)))

(defn mqtt->config [mqtt message]
  (let [topic (:reply-to message)
        cfg (create-config)]
    (mqttapi/publish-scmessage mqtt topic (assoc message :payload cfg))))

(defn mqtt->register [message]
  (let [device (:payload message)]
    (devicemodel/create-device device)))

(defrecord ConfigComponent [mqtt]
  component/Lifecycle
  (start [this]
    (mqttapi/subscribe mqtt "/config/register" mqtt->register)
    (mqttapi/subscribe mqtt "/config" (partial mqtt->config mqtt))
    (assoc this :routes (routes)))
  (stop [this]
    this))

(defn make-config-component []
  (map->ConfigComponent {}))
