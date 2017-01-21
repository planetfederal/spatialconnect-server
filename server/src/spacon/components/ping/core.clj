(ns spacon.components.ping.core
  (:require [com.stuartsierra.component :as component]
            [spacon.http.intercept :as intercept]
            [spacon.http.response :as response]
            [spacon.components.mqtt.core :as mqttapi]
            [clojure.data.json :as json]
            [clojure.tools.logging :as log]))

(defn- pong
  "Responds with pong as a way to ensure http service is reachable"
  [request]
  (response/ok "pong"))

(defn- routes [] #{["/api/ping"
                    :get
                    (conj intercept/common-interceptors `pong)]})

(defn mqtt-ping
  "Responds with pong as a way to ensure mqtt broker is reachable"
  [mqttcomp message]
  (mqttapi/publish-scmessage mqttcomp
                             (:reply-to message)
                             (assoc message :payload {:result "pong"})))

(defrecord PingComponent [mqtt]
  component/Lifecycle
  (start [this]
    (log/debug "Starting Ping Component")
    (mqttapi/subscribe mqtt "/ping" (partial mqtt-ping mqtt))
    (assoc this :routes (routes)))
  (stop [this]
    (log/debug "Stopping Ping Component")
    this))

(defn make-ping-component []
  (map->PingComponent {}))
