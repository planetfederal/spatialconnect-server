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
            [spacon.components.store.db :as storemodel]
            [spacon.components.device.db :as devicemodel]
            [spacon.components.kafka.core :as kafkaapi]
            [spacon.components.http.auth :refer [token->user check-auth]]
            [spacon.components.form.db :as formmodel]
            [clojure.tools.logging :as log]))

(defn create-config
  "Returns a map of the config by fetching the stores and forms
  for teams that user belongs to"
  [config-comp user]
  (log/debug "Creating config for user" user)
  (let [teams (map :id (:teams user))]
    {:stores (filter (fn [s]
                       (> (.indexOf teams (:team_id s)) -1))
                     (storemodel/all))
     :forms  (filter (fn [f]
                       (> (.indexOf teams (:team_id f)) -1))
                     (formmodel/all))}))

(defn- kafka->config
  "kafka message handler that receives the request for a config
   from a device and responds by publishing the requested config
   on its reply-to topic"
  [config-comp kafka-comp message]
  (log/debug "Received request for config" message)
  (let [topic (:reply-to message)
        jwt   (:jwt message)
        user  (token->user jwt)
        cfg   (create-config config-comp user)]
    (log/debug "Sending config to" user)
    (kafkaapi/publish-map kafka-comp (assoc message :payload cfg))))

(defn- kafka->register
  "kafka message handler that registers a device"
  [message]
  (let [device (:payload message)]
    (log/debug "Registering device" device)
    (devicemodel/create device)))

(defrecord ConfigComponent [kafka]
  component/Lifecycle
  (start [this]
    (log/debug "Starting Config Component")
    (kafkaapi/subscribe kafka "/config/register" kafka->register)
    (kafkaapi/subscribe kafka "/config" (partial kafka->config this kafka))
    this)
  (stop [this]
    (log/debug "Stopping Config Component")
    this))

(defn make-config-component []
  (map->ConfigComponent {}))
