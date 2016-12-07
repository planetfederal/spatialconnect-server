(ns spacon.components.ping
  (:require [com.stuartsierra.component :as component]
            [spacon.http.intercept :as intercept]
            [spacon.http.response :as response]
            [spacon.components.mqtt :as mqttapi]
            [clojure.data.json :as json]))

(defn- pong
  [request]
  (response/ok "pong"))

(defn- routes [] #{["/api/ping" :get (conj intercept/common-interceptors `pong)]})

(defn mqtt-ping [mqttcomp message]
  (mqttapi/publish-scmessage mqttcomp (:reply-to message) (update message :payload {:result "pong"})))

(defrecord PingComponent [mqtt]
  component/Lifecycle
  (start [this]
    (mqttapi/subscribe mqtt "/ping" (partial mqtt-ping mqtt))
    (assoc this :routes (routes)))
  (stop [this]
    this))

(defn make-ping-component []
  (map->PingComponent {}))