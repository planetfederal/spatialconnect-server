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
   [spacon.components.http.location :as location-http]
   [spacon.components.http.notification :as notif-http]
   [spacon.components.http.store :as store-http]
   [spacon.components.http.ping :as ping-http]
   [spacon.components.http.user :as user-http]
   [spacon.components.http.team :as team-http]
   [clojure.tools.logging :as log]))

(defrecord HttpService [http-config ping user team device location store config kafka form notify]
  component/Lifecycle
  (start [this]
    (log/debug "Starting HttpService component")
    (let [routes #(route/expand-routes
                   (clojure.set/union #{}
                                      (auth/routes)
                                      (ping-http/routes ping)
                                      (user-http/routes user)
                                      (team-http/routes team)
                                      (device-http/routes device)
                                      (location-http/routes location)
                                      (store-http/routes kafka store)
                                      (config-http/routes config)
                                      (form-http/routes form kafka)
                                      (notif-http/routes notify)))]
      (assoc this :service-def (merge http-config
                                      {:env                     :prod
                                       ::http/routes            routes
                                       ::http/resource-path     "/public"
                                       ::http/type              :jetty
                                       ::http/port              (or (some-> (System/getenv "PORT")
                                                                            Integer/parseInt)
                                                                    8085)
                                       ::http/allowed-origins   {:creds           true
                                                                 :allowed-origins (constantly true)}
                                       ::http/container-options {:h2c? true
                                                                 :h2?  false
                                                                 :ssl? false}}))))

  (stop [this]
    (log/debug "Starting HttpService component")
    this))

(defn make-http-service-component [http-config]
  (map->HttpService {:http-config http-config}))
