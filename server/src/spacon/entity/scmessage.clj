(ns spacon.entity.scmessage
  (:require [clojure.data.json :as json]
            [clojure.string :refer [blank?]]
            [camel-snake-kebab.core :refer :all]
            [camel-snake-kebab.extras :refer [transform-keys]]
            [clojure.tools.logging :as log])
  (:import (com.boundlessgeo.spatialconnect.schema
            SCMessageOuterClass$SCMessage)))

(defn- bytes->map [proto]
  (let [scm (SCMessageOuterClass$SCMessage/parseFrom proto)
        p (.getPayload scm)
        payload (if (blank? p) {} (json/read-str p :key-fn ->kebab-case-keyword))]
    (try
      {:correlation-id (.getCorrelationId scm)
       :jwt (.getJwt scm)
       :reply-to (.getReplyTo scm)
       :action (.getAction scm)
       :payload payload}
      (catch Exception e
        (log/error "Could not parse protobuf into map b/c"
                   (.getLocalizedMessage e))))))

(defn- make-protobuf [correlation-id jwt reply-to action payload]
  (-> (SCMessageOuterClass$SCMessage/newBuilder)
      (.setReplyTo reply-to)
      (.setJwt jwt)
      (.setAction action)
      (.setPayload payload)
      (.setCorrelationId correlation-id)
      (.build)))

(defrecord SCMessage [correlation-id jwt reply-to action payload])

(defn from-bytes
  "Deserializes the protobuf byte array into an SCMessage record"
  [b]
  (map->SCMessage (bytes->map b)))

(defn message->bytes
  "Serializes an SCMessage record into a protobuf byte array"
  [message]
  (.toByteArray (make-protobuf
                 (or (get message :correlation-id) -1)
                 (or (get message :jwt) "")
                 (or (get message :reply-to) "")
                 (or (get message :action) -1)
                 (json/write-str (or (get message :payload) "{}") :key-fn ->snake_case_string))))
