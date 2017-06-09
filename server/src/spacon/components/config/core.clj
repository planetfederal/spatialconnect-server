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
            [spacon.components.queue.protocol :as queueapi]
            [spacon.components.http.auth :refer [token->user check-auth]]
            [spacon.components.form.db :as formmodel]
            [clojure.tools.logging :as log]
            [spacon.specs.msg]
            [clojure.spec :as s]))

(defn create-config
  "Returns a map of the config by fetching the stores and forms
  for teams that user belongs to"
  [config-comp user]
  (log/debugf "Creating config for user" user)
  (let [teams (map :id (:teams user))]
    {:stores (filter (fn [s]
                       (> (.indexOf teams (:team_id s)) -1))
                     (storemodel/all))
     :forms  (filter (fn [f]
                       (> (.indexOf teams (:team_id f)) -1))
                     (formmodel/all))}))

(defn- queue->config
  "Queue message handler that receives the request for a config
   from a device and responds by publishing the requested config
   on its reply-to topic"
  [config-comp queue-comp msg]
  (if (s/valid? :spacon.specs.msg/msg msg)
    (do (log/debugf "Received request for config" msg)
        (let [user  (token->user (:jwt msg))
              cfg   (create-config config-comp user)]
          (log/debugf "Sending config to" user)
          (queueapi/publish queue-comp (assoc msg :payload cfg))))
    (log/errorf "config message was invalid b/c %s" (s/explain :spacon.specs.msg/msg msg))))

(defn- queue->register
  "Queue message handler that registers a device"
  [msg]
  (let [device (:payload msg)]
    (log/debugf "Registering device" device)
    (devicemodel/create device)))

(defrecord ConfigComponent [queue]
  component/Lifecycle
  (start [this]
    (log/debug "Starting Config Component")
    (queueapi/subscribe queue :register-device queue->register)
    (queueapi/subscribe queue :full-config (partial queue->config this queue))
    this)
  (stop [this]
    (log/debug "Stopping Config Component")
    this))

(defn make-config-component []
  (map->ConfigComponent {}))
