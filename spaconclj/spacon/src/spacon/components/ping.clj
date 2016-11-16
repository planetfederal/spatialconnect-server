(ns spacon.components.ping
  (:require [com.stuartsierra.component :as component]
            [spacon.http.intercept :as intercept]
            [spacon.http.response :as response]
            [clojure.data.json :as json]))

(defn- pong
  [request]
  (response/success "pong"))

(defn- routes [] #{["/api/ping" :get (conj intercept/common-interceptors `pong)]})

(defrecord PingComponent []
  component/Lifecycle
  (start [this]
    (assoc this :routes (routes)))
  (stop [this]
    this))

(defn make-ping-component []
  (map->PingComponent {}))