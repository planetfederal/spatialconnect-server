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

(ns spacon.entity.connectmessage
  (:require [clojure.data.json :as json]
            [clojure.string :refer [blank?]]
            [clojure.walk :refer [keywordize-keys]]
            [clojure.tools.logging :as log])
  (:import (com.boundlessgeo.schema ConnectMessagePbf$ConnectMessage)))

(defn- bytes->map [proto]
  (let [cm (ConnectMessagePbf$ConnectMessage/parseFrom proto)
        p (.getPayload cm)
        payload (if (blank? p) {} (keywordize-keys (json/read-str p)))]
    (try
      {:context (.getContext cm)
       :correlationId (.getCorrelationId cm)
       :jwt (.getJwt cm)
       :to (.getTo cm)
       :action (.getAction cm)
       :payload payload}
      (catch Exception e
        (log/error "Could not parse protobuf into map b/c"
                   (.getLocalizedMessage e))))))

(defn- make-protobuf [context correlation-id jwt to action payload]
  (-> (ConnectMessagePbf$ConnectMessage/newBuilder)
      (.setContext context)
      (.setTo to)
      (.setJwt jwt)
      (.setAction action)
      (.setPayload payload)
      (.setCorrelationId correlation-id)
      (.build)))

(defrecord ConnectMessage [correlation-id jwt to action payload])

(defn from-bytes
  "Deserializes the protobuf byte array into an ConnectMessage record"
  [b]
  (map->ConnectMessage (bytes->map b)))

(defn message->bytes
  "Serializes an ConnectMessage record into a protobuf byte array"
  [message]
  (.toByteArray (make-protobuf
                  (or (get message :context) "")
                  (or (get message :correlationId) -1)
                  (or (get message :jwt) "")
                  (or (get message :to) "")
                  (or (get message :action) "v1/NO_ACTION")
                  (json/write-str (or (get message :payload) "{}")))))
