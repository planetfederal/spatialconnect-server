(ns spacon.http.service
  (:require
   [io.pedestal.http :as http]
   [io.pedestal.http.route :as route]
   [com.stuartsierra.component :as component]
   [spacon.http.auth :as auth]
   [clojure.tools.logging :as log]))

(defrecord HttpService [http-config ping user team device location trigger store config form mqtt notify]
  component/Lifecycle
  (start [this]
    (log/debug "Starting HttpService component")
    (let [routes #(route/expand-routes
                   (clojure.set/union #{}
                                      (auth/routes)
                                      (:routes ping)
                                      (:routes user)
                                      (:routes team)
                                      (:routes device)
                                      (:routes location)
                                      (:routes trigger)
                                      (:routes store)
                                      (:routes config)
                                      (:routes mqtt)
                                      (:routes form)
                                      (:routes notify)))]
      (assoc this :service-def (merge http-config {:env                     :prod
                                                   ::http/routes            routes
                                                   ::http/resource-path     "/public"
                                                   ::http/type              :jetty
                                                   ::http/port              (or (some-> (System/getenv "PORT")
                                                                                        Integer/parseInt)
                                                                                8085)
                                                   ::http/allowed-origins {:creds true
                                                                           :allowed-origins (constantly true)}
                                                   ::http/container-options {:h2c? true
                                                                             :h2?  false
                                                                             :ssl? false}}))))

  (stop [this]
    (log/debug "Starting HttpService component")
    this))

(defn make-http-service-component [http-config]
  (map->HttpService {:http-config http-config}))
