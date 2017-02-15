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

(ns spacon.components.http.core
  (:require
   [io.pedestal.http :as http]
   [io.pedestal.http.route :as route]
   [com.stuartsierra.component :as component]
   [spacon.components.http.auth :as auth]
   [spacon.components.http.form :as form-http]
   [spacon.components.http.config :as config-http]
   [spacon.components.http.device :as device-http]
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
                                      (device-http/routes device)
                                      (:routes location)
                                      (:routes trigger)
                                      (:routes store)
                                      (:routes config)
                                      (config-http/routes config)
                                      (:routes mqtt)
                                      (form-http/routes form mqtt)
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
