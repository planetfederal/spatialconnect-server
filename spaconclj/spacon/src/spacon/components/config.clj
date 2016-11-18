(ns spacon.components.config
  (:require [com.stuartsierra.component :as component]
            [spacon.util.protobuf :as pbf]
            [spacon.http.intercept :as intercept]
            [spacon.http.response :as response]
            [spacon.models.store :as store]
            [spacon.components.mqtt :as mqttcomponent]))

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
    (mqttcomponent/listenOnTopic mqtt "/config"
      (fn [_ _ ^bytes payload]
        (let [message (pbf/bytes->map payload)]
          (mqttcomponent/publishToTopic mqtt (:replyTo message) (pbf/map->protobuf (assoc message :payload "New Config"))))))
    this)
  (stop [this]
    this))

(defn make-config-component []
  (map->ConfigComponent {}))
