(ns spacon.components.ping
  (:require [com.stuartsierra.component :as component]))

(defrecord PingComponent [db]
  component/Lifecycle
  (start [this]
    (print "Starting Ping")
    )
  (stop [this]
    (print "Stopping Ping")
    ))



(def routes #{["/" :get ]})