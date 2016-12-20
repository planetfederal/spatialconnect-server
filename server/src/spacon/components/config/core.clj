(ns spacon.components.config.core
  (:require [com.stuartsierra.component :as component]
            [spacon.http.intercept :as intercept]
            [spacon.http.response :as response]
            [spacon.components.store.db :as storemodel]
            [spacon.components.device.db :as devicemodel]
            [spacon.components.mqtt.core :as mqttapi]
            [spacon.http.auth :refer [token->user check-auth]]
            [spacon.components.form.db :as formmodel]))

(defn create-config [user]
  (let [teams (map :id (:teams user))]
    {:stores (filter (fn [s]
                       (> (.indexOf teams (:team_id s)) -1))
                     (storemodel/all))
     :forms  (filter (fn [f]
                       (> (.indexOf teams (:team_id f)) -1))
                     (formmodel/all))}))

(defn http-get [request]
  (let [d (create-config (get-in request [:identity :user]))]
    (response/ok d)))

(defn- routes [] #{["/api/config" :get
                    (conj intercept/common-interceptors check-auth `http-get)]})

(defn mqtt->config [mqtt message]
  (let [topic (:reply-to message)
        jwt (:jwt message)
        user (token->user jwt)
        cfg (create-config user)]
    (mqttapi/publish-scmessage mqtt topic (assoc message :payload cfg))))

(defn mqtt->register [message]
  (let [device (:payload message)]
    (devicemodel/create device)))

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
