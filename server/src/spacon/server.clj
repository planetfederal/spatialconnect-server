(ns spacon.server
  (:gen-class)                                              ; for -main method in uberjar
  (:require [io.pedestal.http :as server]
            [spacon.http.service :as service]
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
            [spacon.components.form.core :as form]))

(defrecord Server [service]
  component/Lifecycle
  (start [component]
    (let [server (server/create-server (:service-def service))]
      (println "Starting Server")
      (server/start server)
      (assoc component :server server)))
  (stop [component]
    (println "Stopping Server")
    (update-in component [:server] server/stop)))

(defn new-server []
  (map->Server {}))

(defn system
  "Returns a new instance of the system"
  [config-options]
  (let [{:keys [http-config mqtt-config]} config-options]
    (component/system-map
     :user (user/make-user-component)
     :team (team/make-team-component)
     :mqtt (mqtt/make-mqtt-component mqtt-config)
     :ping (component/using (ping/make-ping-component) [:mqtt])
     :device (component/using (device/make-device-component) [:mqtt])
     :config (component/using (config/make-config-component) [:mqtt])
     :notify (component/using (notification/make-notification-component) [:mqtt])
     :trigger (component/using (trigger/make-trigger-component) [:notify])
     :store (component/using (store/make-store-component) [:mqtt :trigger])
     :location (component/using (location/make-location-component) [:mqtt :trigger])
     :form (component/using (form/make-form-component) [:mqtt :trigger])
     :service (component/using
               (service/make-service http-config)
               [:ping :user :team :device :location :trigger :store :config :form :mqtt])
     :server (component/using
              (new-server)
              [:service]))))

(defn -main
  "The entry-point for 'lein run'"
  [& args]
  (println "\nCreating your server...")
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
  (component/start-system (system {:http-config {}
                                   :mqtt-config {:broker-url (System/getenv "MQTT_BROKER_URL")}})))

