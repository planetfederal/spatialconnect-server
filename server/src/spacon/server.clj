;; Copyright 2016-2017 Boundless, http://boundlessgeo.com
;;
;; Licensed under the Apache License, Version 2.0 (the "License");
;; you may not use this file except in compliance with the License.
;; You may obtain a copy of the License at
;;
;; http://www.apache.org/licenses/LICENSE-2.0
;;
;; Unless required by applicable law or agreed to in writing, software
;; distributed under the License is distributed on an "AS IS" BASIS,
;; WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
;; See the License for the specific language governing permissions and
;; limitations under the License.

(ns spacon.server
  (:gen-class)                                              ; for -main method in uberjar
  (:require [io.pedestal.http :as server]
            [spacon.components.http.core :as http]
            [com.stuartsierra.component :as component]
            [spacon.components.ping.core :as ping]
            [spacon.components.user.core :as user]
            [spacon.components.team.core :as team]
            [spacon.components.device.core :as device]
            [spacon.components.config.core :as config]
            [spacon.components.store.core :as store]
            [spacon.components.location.core :as location]
            [spacon.components.trigger.core :as trigger]
            [spacon.components.mqtt.core :as mqtt]
            [spacon.components.notification.core :as notification]
            [spacon.components.form.core :as form]
            [spacon.components.kafka.core :as kafka]
            [clojure.tools.logging :as log]))

(defrecord SpaconServer [http-service]
  component/Lifecycle
  (start [component]
    (log/info "Starting SpaconServer Component")
    (let [server (server/create-server (:service-def http-service))]
      (server/start server)
      (assoc component :http-server server)))
  (stop [component]
    (log/info "Stopping SpaconServer Component")
    (update-in component [:http-server] server/stop)))

(defn new-spacon-server []
  (map->SpaconServer {}))

(defn make-spacon-server
  "Returns a new instance of the system"
  [config-options]
  (log/debug "Making server config with these options" config-options)
  (let [{:keys [http-config mqtt-config kafka-producer-config kafka-consumer-config]} config-options]
    (component/system-map
     :user (user/make-user-component)
     :team (team/make-team-component)
     :mqtt (mqtt/make-mqtt-component mqtt-config)
     :kafka (kafka/make-kafka-component kafka-producer-config kafka-consumer-config)
     :ping (component/using (ping/make-ping-component) [:mqtt :kafka])
     :device (component/using (device/make-device-component) [:mqtt])
     :config (component/using (config/make-config-component) [:mqtt])
     :notify (component/using (notification/make-notification-component) [:mqtt])
     :trigger (component/using (trigger/make-trigger-component) [:notify])
     :store (component/using (store/make-store-component) [:mqtt :trigger])
     :location (component/using (location/make-location-component) [:mqtt :trigger])
     :form (component/using (form/make-form-component) [:mqtt :trigger])
     :http-service (component/using
                    (http/make-http-service-component http-config)
                    [:ping :user :team :device :location :trigger
                     :store :config :form :mqtt :notify])
     :server (component/using (new-spacon-server) [:http-service]))))

(defn -main
  "The entry-point for 'lein run'"
  [& _]
  (log/info "Configuring the server...")
  ;; create global uncaught exception handler so threads don't silently die
  (Thread/setDefaultUncaughtExceptionHandler
   (reify Thread$UncaughtExceptionHandler
     (uncaughtException [_ thread ex]
       (log/error ex "Uncaught exception on thread" (.getName thread)))))
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
  ;; todo: auto migrate flag?
  (component/start-system
   (make-spacon-server {:http-config {}
                        :mqtt-config {:broker-url (System/getenv "MQTT_BROKER_URL")}
                        :kafka-producer-config {:timeout-ms 2000}
                        :kafka-consumer-config {:servers (System/getenv "BOOTSTRAP_SERVERS")
                                                :group-id (System/getenv "GROUP_ID")}})))

