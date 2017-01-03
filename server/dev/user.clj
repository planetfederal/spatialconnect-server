(ns user
  (:require [clojure.pprint :refer (pprint)]
            [clojure.repl :refer :all]
            [com.stuartsierra.component :as component]
            [io.pedestal.http :as server]
            [spacon.server :refer [make-spacon-server]]))

(defn init-dev []
  (System/setProperty "javax.net.ssl.trustStore"
                      (or (System/getenv "TRUST_STORE")
                          "tls/test-cacerts.jks"))
  (System/setProperty "javax.net.ssl.trustStoreType"
                      (or (System/getenv "TRUST_STORE_TYPE")
                          "JKS"))
  (System/setProperty "javax.net.ssl.trustStorePassword"
                      (or (System/getenv "TRUST_STORE_PASSWORD")
                          "changeit"))
  (System/setProperty "javax.net.ssl.keyStore"
                      (or (System/getenv "KEY_STORE")
                          "tls/test-keystore.p12"))
  (System/setProperty "javax.net.ssl.keyStoreType"
                      (or (System/getenv "KEY_STORE_TYPE")
                          "pkcs12"))
  (System/setProperty "javax.net.ssl.keyStorePassword"
                      (or (System/getenv "KEY_STORE_PASSWORD")
                          "somepass"))
  (make-spacon-server {:http-config {:env                     :dev
                         ::server/join?           false
                         ::server/allowed-origins {:creds true
                                                   :allowed-origins (constantly true)}}
                       :mqtt-config {:broker-url (or (System/getenv "MQTT_BROKER_URL")
                                         "tcp://localhost:1883")}}))

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
