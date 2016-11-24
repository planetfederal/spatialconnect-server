(ns spacon.components.mqtt
  (:require [com.stuartsierra.component :as component]
            [clojurewerkz.machine-head.client :as mh]
            [spacon.entity.scmessage :as scm]
            [camel-snake-kebab.core :refer :all]
            [camel-snake-kebab.extras :refer [transform-keys]]
            [spacon.http.intercept :as intercept]
            [spacon.http.response :as response]))

(def id "spacon-server")

(def broker-url (str "tcp://localhost:1883"))

(defn connectmqtt []
  (mh/connect broker-url id))

(defn subscribe [mqtt topic f]
  (mh/subscribe (:conn mqtt) {topic 2} (fn [_ _ ^bytes payload]
                                         (f (scm/from-bytes payload)))))

(defn- publish [conn topic message]
  (mh/publish conn topic (scm/message->bytes message)))

(defn publish-scmessage [mqtt topic message]
  (publish (:conn mqtt) topic message))

(defn publish-map [mqtt topic m]
  (publish (:conn mqtt) topic (scm/map->SCMessage {:payload m})))

(defn http-mq-post [mqtt context]
  (let [m (:json-params context)
        t (transform-keys ->kebab-case-keyword m)]
    (publish-map mqtt (:topic m) t))
  (response/ok "success"))

(defn- routes [mqtt] #{["/api/mqtt" :post
                            (conj intercept/common-interceptors (partial http-mq-post mqtt)) :route-name :http-mq-post]})

(defrecord MqttComponent [mqtt-config]
  component/Lifecycle
  (start [this]
    (let [m (connectmqtt)
          c (assoc this :conn m)]
      (assoc c :routes (routes c))))
  (stop [this]
    (println "Disconnecting MQTT Client")
    (mh/disconnect (:conn this))
    this))

(defn make-mqtt-component [mqtt-config]
  (map->MqttComponent {:mqtt-config mqtt-config}))
