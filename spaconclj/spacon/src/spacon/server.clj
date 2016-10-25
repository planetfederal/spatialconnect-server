(ns spacon.server
  (:gen-class)                                              ; for -main method in uberjar
  (:require [io.pedestal.http :as server]
            [io.pedestal.http.route :as route]
            [spacon.http.service :as service]
            [com.stuartsierra.component :as component]
            [clojure.tools.namespace.repl :refer (refresh)]))

(defrecord Server [http-service-map]
  component/Lifecycle
  (start [component]
    (let [server (server/create-server http-service-map)]
      (println "Starting Server")
      (server/start server)
      (assoc component :server server)))
  (stop [component]
    (println "Stopping Server")
    (update-in component [:server] server/stop)))

(defn new-server [http-config]
  (map->Server {:http-service-map http-config} ))

(defn system [config-options]
  (let [{:keys [http-config]} config-options]
    (component/system-map
      :server (new-server http-config))))

(defn init-dev []
  (system
    {:http-config
     (merge service/service {:env                     :dev
                             ::server/join?           false
                             ::server/routes          #(route/expand-routes (deref #'service/routes))
                             ::server/allowed-origins {:creds true :allowed-origins (constantly true)}})}))

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
  (component/start-system (system {:http-config service/service})))