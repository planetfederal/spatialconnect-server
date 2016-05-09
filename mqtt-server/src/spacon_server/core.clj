(ns mqtt-server.core
  (:require [clojurewerkz.machine-head.client :as mh]
            [org.httpkit.server :refer [run-server]]
            [mqtt-server.http.handler :as handler :refer :all]))

(defn connectmqtt []
  (let [id (mh/generate-id)
        conn (mh/connect "tcp://127.0.0.1:1883" id)]
    (mh/subscribe conn {"MQTTKitExample" 0}
                  (fn [^String topic _ ^bytes payload]
                    (println (String. payload "UTF-8"))
                    (mh/disconnect conn)
                    (System/exit 0)))
    (mh/publish conn "MQTTKitexample" "Child Please")))

(defn start-services []
  (run-server handler/app {:port 8085})
  (println "SPACON WebServer Started")
  (connectmqtt)
  (println "SPACON SocketServer Started"))

(defn -main [& args] (start-services))
