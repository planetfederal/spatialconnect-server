(ns user
  (:require [clojure.java.io :as io]
            [clojure.string :as str]
            [clojure.pprint :refer (pprint)]
            [clojure.repl :refer :all]
            [clojure.test :as test]
            [com.stuartsierra.component :as component]
            [io.pedestal.http :as server]
            [spacon.server :refer [system]]))


(defn init-dev []
  (system {:http-config {:env                     :dev
                         ::server/join?           false
                         ::server/allowed-origins {:creds true
                                                   :allowed-origins (constantly true)}}
           :mqtt-config {:broker-url      (or (System/getenv "MQTT_BROKER_URL") "tcp://localhost:1883")
                         :broker-username (or (System/getenv "MQTT_BROKER_USERNAME") "admin@something.com")}}))



(def system-val nil)

(defn init []
  (alter-var-root #'system-val (constantly (init-dev))))

(defn start []
  (alter-var-root #'system-val component/start-system))

(defn stop []
  (alter-var-root #'system-val
                  (fn [s] (when s (component/stop-system s)))))

(defn go []
  (init)
  (start))

(defn reset []
  (stop)
  (go))
