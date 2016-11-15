(ns spacon.http.service
  (:require
    [io.pedestal.http :as http]
    [io.pedestal.http.route :as route]
    [com.stuartsierra.component :as component]
    [spacon.http.auth :as auth]))

(defrecord Service [http-config ping user device location trigger store config]
  component/Lifecycle
  (start [this]
    (assoc this :service-def (merge http-config {:env                     :prod
                                                 ::http/routes            #(route/expand-routes
                                                                            (clojure.set/union #{}
                                                                                               (auth/routes)
                                                                                               (:routes ping)
                                                                                               (:routes user)
                                                                                               (:routes device)
                                                                                               (:routes location)
                                                                                               (:routes trigger)
                                                                                               (:routes store)
                                                                                               (:routes config)))
                                                 ::http/resource-path     "/public"
                                                 ::http/type              :jetty
                                                 ::http/port              8080
                                                 ::http/container-options {:h2c? true
                                                                           :h2?  false
                                                                           :ssl? false}})))
  (stop [this]
    this))

(defn make-service [http-config]
  (map->Service {:http-config http-config}))