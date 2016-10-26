(ns spacon.components.device
  (:require [com.stuartsierra.component :as component]
            [spacon.http.intercept :as intercept]
            [clojure.data.json :as json]
            [ring.util.response :as ring-resp]))

(defn- device
  [request]
  (ring-resp/response (json/write-str {:response "ping"})))

(defn- routes [] #{["/pong" :get (conj intercept/common-interceptors `device)]})

(defrecord DeviceComponent [database]
  component/Lifecycle
  (start [this]
    (print "Starting Device")
    (assoc this :routes (routes)))
  (stop [this]
    (print "Stopping Device")
    this))

(defn make-device-component []
  (map->DeviceComponent {}))