(ns spacon.entity.scmessage
  (:require [clojure.data.json :as json])
  (:import (com.boundlessgeo.spatialconnect.schema
           SCMessageOuterClass$SCMessage)))

(defn- bytes->map [proto]
  (let [scm (SCMessageOuterClass$SCMessage/parseFrom proto)]
    {:correlationId (.getCorrelationId scm)
     :jwt (.getJwt scm)
     :replyTo (.getReplyTo scm)
     :action (.getAction scm)
     :payload (.getPayload scm)}))

(defn- make-protobuf [correlation-id jwt reply-to action payload]
  (-> (SCMessageOuterClass$SCMessage/newBuilder)
      (.setReplyTo reply-to)
      (.setJwt jwt)
      (.setAction action)
      (.setPayload payload)
      (.setCorrelationId correlation-id)
      (.build)))

(defrecord SCMessage [correlation-id jwt reply-to action payload])

(defn from-bytes [b]
  (map->SCMessage (bytes->map b)))

(defn message->bytes [message]
  (.toByteArray (make-protobuf
                  (or (get message :correlation-id) -1)
                  (or (get message :jwt) "")
                  (or (get message :reply-to) "")
                  (or (get message :action) -1)
                  (or (json/write-str (get message :payload)) ""))))