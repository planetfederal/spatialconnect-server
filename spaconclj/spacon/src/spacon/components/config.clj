(ns spacon.components.config
  (:require [com.stuartsierra.component :as component]
            [spacon.util.protobuf :as pbf]
            [spacon.http.intercept :as intercept]
            [spacon.http.response :as response]
            [spacon.components.mqtt :as mqtt]
            [spacon.models.store :as store]))

(defn create-config []
  {:stores (store/store-list)})

(defn http-get [context]
  (let [d (create-config)]
    (response/success d)))

(defn- routes [] #{["/api/config" :get
                    (conj intercept/common-interceptors `http-get)]
                   })

(defrecord ConfigComponent [mqtt]
  component/Lifecycle
  (start [this]
    (mqtt/listenOnTopic mqtt "/config"
      (fn [_ _ ^bytes payload]
        (let [message (pbf/bytes->map payload)]
          (mqtt/publishToTopic mqtt (:replyTo message) (pbf/map->protobuf (assoc message :payload "New Config"))))))
    (assoc this :routes (routes)))
  (stop [this]
    this))

(defn make-config-component []
  (map->ConfigComponent {}))