(ns spacon.server
  (:gen-class)                                              ; for -main method in uberjar
  (:require [io.pedestal.http :as server]
            [io.pedestal.http.route :as route]
            [spacon.http.service :as service]
            [com.stuartsierra.component :as component]
            [clojure.tools.namespace.repl :refer (refresh)]
            [spacon.components.ping :as ping]
            [spacon.components.device :as device]
            [spacon.components.config :as config]
            [spacon.components.location :as location]
            [spacon.components.trigger :as trigger]))

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
  (map->Server {} ))

(defn system [config-options]
  (let [{:keys [http-config]} config-options]
    (component/system-map
      :ping (ping/make-ping-component)
      :device (device/make-device-component)
      :config (config/make-config-component)
      :location (location/make-location-component)
      :trigger (trigger/make-trigger-component)
      :service (component/using
                 (service/make-service http-config)
                 [:ping :device :location :trigger])
      :server (component/using
                (new-server)
                [:service]))))

(defn init-dev []
  (system
    {:http-config
     {:env                     :dev
      ::server/join?           false
      ::server/allowed-origins {:creds true :allowed-origins (constantly true)}}}))

(defn stop-dev []
  (component/stop-system system))

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

(defn -main
  "The entry-point for 'lein run'"
  [& args]
  (println "\nCreating your server...")
  (component/start-system (system {:http-config {}})))