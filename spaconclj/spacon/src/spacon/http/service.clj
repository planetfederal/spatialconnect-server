(ns spacon.http.service
  (:require [clojure.data.json :as json]
            [io.pedestal.http :as http]
            [io.pedestal.http.route :as route]
            [io.pedestal.http.body-params :as body-params]
            [io.pedestal.http.content-negotiation :as conneg]
            [ring.util.response :as ring-resp]
            [spacon.components.ping :as ping]
            [com.stuartsierra.component :as component]))

(defrecord Service [http-config ping device location]
  component/Lifecycle
  (start [this]
    (println (:routes ping))
      (assoc this :service-def (merge http-config {:env :prod
                                               ::http/routes #(route/expand-routes
                                                               (clojure.set/union #{}
                                                                                  (:routes ping)
                                                                                  (:routes device)
                                                                                  (:routes location)))
                                               ::http/resource-path "/public"
                                               ::http/type :jetty
                                               ::http/port 8080
                                               ::http/container-options {:h2c? true
                                                                         :h2? false
                                                                         :ssl? false}})))
  (stop [this]
    this))

(defn make-service [http-config]
  (map->Service {:http-config http-config}))