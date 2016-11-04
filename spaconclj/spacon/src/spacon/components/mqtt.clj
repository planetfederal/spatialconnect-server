(ns spacon.components.mqtt
  (:require [com.stuartsierra.component :as component]
            [clojurewerkz.machine-head.client :as mh])
  (:import
    (com.boundlessgeo.spatialconnect.schema SCMessageOuterClass$SCMessage SCCommand SCMessageOuterClass)))

(def id "spacon-server")

(def broker-url (str "tcp://localhost:1883"))

(defn parseProto [proto]
  {:correlationId (.getCorrelationId proto)
   :replyTo (.getReplyTo proto)
   :action (.getAction proto)
   :payload (.getPayload proto)})

(SCCommand/AUTHSERVICE_ACCESS_TOKEN)

(defn writeProto [correlation-id reply-to action payload]
  (-> (SCMessageOuterClass$SCMessage/newBuilder)
      (.setReplyTo reply-to)
      (.setAction action)
      (.setPayload payload)
      (.setCorrelationId correlation-id)
      (.build)))

(defn- connectmqtt []
  (mh/connect broker-url id))

(defn publish [mqtt topic message]
  ;
  (mh/publish (:conn mqtt) topic (.toByteArray message)))

(defn subscribe [mqtt topic]
  (mh/subscribe (:conn mqtt) {topic 0} (fn [^String topic _ ^bytes payload]
                                         (SCMessageOuterClass$SCMessage/parseFrom payload))))

(defrecord MqttComponent [mqtt-config]
  component/Lifecycle
  (start [this]
    (assoc this :conn (connectmqtt)))
  (stop [this]
    (mh/disconnect (:conn this))
    this))

(defn make-mqtt-component [mqtt-config]
  (map->MqttComponent {:mqtt-config mqtt-config}))