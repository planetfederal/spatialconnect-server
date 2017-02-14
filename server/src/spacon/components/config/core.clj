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

(ns spacon.components.config.core
  (:require [com.stuartsierra.component :as component]
            [spacon.components.http.intercept :as intercept]
            [spacon.components.http.response :as response]
            [spacon.components.store.db :as storemodel]
            [spacon.components.device.db :as devicemodel]
            [spacon.components.mqtt.core :as mqttapi]
            [spacon.components.http.auth :refer [token->user check-auth]]
            [spacon.components.form.db :as formmodel]
            [clojure.tools.logging :as log]))

(defn create-config
  "Returns a map of the config by fetching the stores and forms
  for teams that user belongs to"
  [user]
  (log/debug "Creating config for user" user)
  (let [teams (map :id (:teams user))]
    {:stores (filter (fn [s]
                       (> (.indexOf teams (:team-id s)) -1))
                     (storemodel/all))
     :forms  (filter (fn [f]
                       (> (.indexOf teams (:team-id f)) -1))
                     (formmodel/all))}))

(defn http-get
  "Returns an http response with the config for the user"
  [request]
  (log/debug "Getting config")
  (let [d (create-config (get-in request [:identity :user]))]
    (response/ok d)))

(defn- routes [] #{["/api/config" :get
                    (conj intercept/common-interceptors check-auth `http-get)]})

(defn mqtt->config
  "MQTT message handler that receives the request for a config
   from a device and responds by publishing the requested config
   on its reply-to topic"
  [mqtt message]
  (log/debug "Received request for config" message)
  (let [topic (:reply-to message)
        jwt   (:jwt message)
        user  (token->user jwt)
        cfg   (create-config user)]
    (log/debug "Sending config to" user)
    (mqttapi/publish-scmessage mqtt topic (assoc message :payload cfg))))

(defn mqtt->register
  "MQTT message handler that registers a device"
  [message]
  (let [device (:payload message)]
    (log/debug "Registering device" device)
    (devicemodel/create device)))

(defrecord ConfigComponent [mqtt]
  component/Lifecycle
  (start [this]
    (log/debug "Starting Config Component")
    (mqttapi/subscribe mqtt "/config/register" mqtt->register)
    (mqttapi/subscribe mqtt "/config" (partial mqtt->config mqtt))
    (assoc this :routes (routes)))
  (stop [this]
    (log/debug "Stopping Config Component")
    this))

(defn make-config-component []
  (map->ConfigComponent {}))
