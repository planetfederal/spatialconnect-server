(ns spacon.util.protobuf
  (:import (com.boundlessgeo.spatialconnect.schema SCMessageOuterClass$SCMessage)))

(defn bytes->map [proto]
  (let [scm (SCMessageOuterClass$SCMessage/parseFrom proto)]
    {:correlationId (.getCorrelationId scm)
     :replyTo (.getReplyTo scm)
     :action (.getAction scm)
     :payload (.getPayload scm)}))

(defn ->protobuf [correlation-id reply-to action payload]
  (-> (SCMessageOuterClass$SCMessage/newBuilder)
      (.setReplyTo reply-to)
      (.setAction action)
      (.setPayload payload)
      (.setCorrelationId correlation-id)
      (.build)))

(defn map->protobuf [m]
  (->protobuf (:correlationId m) (:replyTo m) (:action m) (:payload m)))