(ns spacon.components.ping
  (:require [com.stuartsierra.component :as component]
            [spacon.http.intercept :as intercept]
            [clojure.data.json :as json]
            [ring.util.response :as ring-resp]))

(defn- pong
  [request]
  (ring-resp/response (json/write-str {:response "pong"})))

(defn- routes [] #{["/api/ping" :get (conj intercept/common-interceptors `pong)]})

(defrecord PingComponent []
  component/Lifecycle
  (start [this]
    (assoc this :routes (routes)))
  (stop [this]
    (print "Stopping Ping")
    this))

(defn make-ping-component []
  (map->PingComponent {}))