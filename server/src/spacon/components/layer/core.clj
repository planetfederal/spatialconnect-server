;; Copyright 2017 Boundless, http://boundlessgeo.com
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

(ns spacon.components.layer.core
  (:require  [com.stuartsierra.component :as component]
             [clojure.tools.logging :as log]
             [clojure.spec :as s]
             [spacon.components.layer.db :as db]))

;; specs for a layer
(s/def ::id pos-int?)
(s/def ::name string?)
(s/def ::extent (s/cat :min-x number?
                       :min-y number?
                       :max-x number?
                       :max-y number?))
;; todo: define this more...url required?  geom type? source (geoserver/wfs, sde, postgis)?
(s/def ::properties map?)
;; this should be the namespace of the replica (ex geoserver-url.workspace or deviceid.group-name)
(s/def ::source string?)
(s/def ::layer (s/keys :req-un [::id ::name ::extent ::source ::properties]))

;; specs for layer events
(s/def ::layer-operation #{:created :updated :deleted})
(s/def ::data map?)
(s/def ::timestamp (s/int-in 0 Long/MAX_VALUE))
(s/def ::vector-clock (s/int-in 0 Integer/MAX_VALUE))
(s/def ::layer-event (s/keys :req-un [::name ::source ::layer-operation ::data ::vector-clock ::timestamp]))

;; specs for pagination
(s/def ::total (s/int-in 0 Integer/MAX_VALUE))
(s/def ::limit (s/int-in 0 Integer/MAX_VALUE))
(s/def ::offset (s/int-in 0 Integer/MAX_VALUE))


(defprotocol LayerService
  (-create-layer [this layer-config]
    "Creates a \"layer create event\" from the layer-config and writes it to the event log.
    Returns the created layer")
  (-list-layers [this offset limit]
    "Returns a map of :layers, :limit, :offset, and :total")
  (-get-layer-by-id [this id]
    "Returns the layer with the given id, or nil if none are found."))

(s/def ::LayerService (partial satisfies? LayerService))

(defn create-layer
  "Creates a \"layer created event\" from the layer-config and writes it to the event log.
  Returns the created layer"
  [api layer-config]
  (log/debugf "Creating layer from config %s" layer-config)
  (-create-layer api layer-config))

(s/def ::config (s/keys :req-un [::name ::source]
                        :opt-un [::extent ::properties]))
(s/fdef create-layer
        :args (s/cat :api ::LayerService
                     :layer-config ::config)
        :ret ::layer)

(defn list-layers
  "Returns a map of :layers, :limit, :offset, and :total.
  The default limit is 100 and default offset is 0"
  ([api] (list-layers api 0))
  ([api offset] (list-layers api offset 100))
  ([api offset limit]
   (log/debugf "Querying layers with offset %s and limit %s" offset limit)
   (-list-layers api offset limit)))

(s/def ::layers (s/every ::layer))
(s/fdef list-commands
        :args (s/cat :api ::CommandService
                     :offset ::offset
                     :limit ::limit)
        :ret (s/keys :req-un [::layers ::total ::limit ::offset]))


(defn get-layer-by-id
  "Returns the layer with the given id, or nil if none are found."
  [api id]
  (log/debugf "Finding layer for id %s" id)
  (-get-layer-by-id api id))

(s/fdef get-layer-by-id
        :args (s/cat :api ::LayerService
                     :id  ::id)
        :ret ::layer)


(defrecord LayerComponent [kafka-producer]
  ;; todo: we should pass a database component down into this like the kafka-producer
  LayerService
  (-create-layer [this layer-config]
    (db/create-layer layer-config))
  (-list-layers [this offset limit]
    (db/list-layers offset limit))
  (-get-layer-by-id [this id]
    (db/get-layer-by-id id))

  component/Lifecycle
  (start [this]
    (log/debug "Starting Layer Component")
    (assoc this :kafka-producer kafka-producer))
  (stop [this]
    (log/debug "Starting Form Component")
    this))

(defn make-layer-component []
  (map->LayerComponent {}))
