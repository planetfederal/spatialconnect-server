(ns mqtt-server.core
  (:gen-class)
  (:require [clojurewerkz.machine-head.client :as mh]
            [org.httpkit.server :refer [run-server]]
            [mqtt-server.http.handler :as handler :refer :all]
            [environ.core :refer [env]]
            [clojure.tools.logging :as log]))

(def broker-url (str "tcp://" (env :mqtt-broker-hostname) ":" (env :mqtt-broker-port)))

(defn connectmqtt []
  (let [id (mh/generate-id)
        conn (mh/connect broker-url id)]
    (mh/subscribe conn {"MQTTKitExample" 0}
                  (fn [^String topic _ ^bytes payload]
                    (println (String. payload "UTF-8"))
                    (mh/disconnect conn)
                    (System/exit 0)))
    (mh/publish conn "MQTTKitexample" "Child Please")))

(defn start-services []
  (run-server handler/app {:port (Integer/valueOf (env :sc-port)) })
  (log/info (str "SPACON WebServer Started on port " (env :sc-port)))
  (log/info (str "Connecting to mqtt broker " broker-url))
  (connectmqtt)
  (log/info "SPACON SocketServer Started"))

(defn -main [& args] (start-services))
