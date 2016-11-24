(ns spacon.components.config
  (:require [com.stuartsierra.component :as component]
            [spacon.http.intercept :as intercept]
            [spacon.http.response :as response]
            [spacon.models.store :as store]
            [spacon.components.mqtt :as mqttapi]))

(defn create-config []
  {:stores (store/store-list)})

(defn http-get [context]
  (let [d (create-config)]
    (response/ok d)))

(defn- routes [] #{["/api/config" :get
                    (conj intercept/common-interceptors `http-get)]
                   })

(defrecord ConfigComponent [mqtt]
  component/Lifecycle
  (start [this]
    (mqttapi/subscribe mqtt "/config"
      (fn [message]
        (mqttapi/publish-scmessage mqtt (:replyTo message) (assoc message :payload (create-config)))))
    this)
  (stop [this]
    this))

(defn make-config-component []
  (map->ConfigComponent {}))
