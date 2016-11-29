(ns spacon.components.mqtt
  (:require [com.stuartsierra.component :as component]
            [clojurewerkz.machine-head.client :as mh]
            [spacon.entity.scmessage :as scm]
            [camel-snake-kebab.core :refer :all]
            [camel-snake-kebab.extras :refer [transform-keys]]
            [spacon.http.intercept :as intercept]
            [spacon.http.response :as response]
            [clojure.core.async :as async]
            [spacon.http.auth :refer [get-token]]))

(def id "spacon-server")

(def topics (ref {}))

(defn add-topic [topic fn]
  (dosync
    (commute topics assoc (keyword topic) fn)))

(defn remove-topic [topic]
  (dosync
    (commute topics dissoc (keyword topic))))

(defn connectmqtt
  [url token]
  (println "Connecting MQTT Client")
  (mh/connect url id {:username token
                      :password "notused"}))

; publishes message on the send channel
(defn- publish [mqtt topic message]
  (async/go (async/>!! (:publish-channel mqtt) {:topic topic :message (scm/message->bytes message)})))

; receive message on subscribe channel
(defn- receive [mqtt topic payload]
  (async/go (async/>!! (:subscribe-channel mqtt) {:topic topic :message (scm/from-bytes payload)})))

; publishes message on the send channel
(defn- publish [mqtt topic message]
  (async/go (async/>!! (:publish-channel mqtt) {:topic topic :message (scm/message->bytes message)})))

; receive message on subscribe channel
(defn- receive [mqtt topic payload]
  (async/go (async/>!! (:subscribe-channel mqtt) {:topic topic :message (scm/from-bytes payload)})))

(defn subscribe [mqtt topic f]
  (add-topic topic f)
  (mh/subscribe (:conn mqtt) {topic 2} (fn [^String topic _ ^bytes payload]
                                           (receive mqtt topic payload))))

(defn unsubscribe [mqtt topic]
  (remove-topic topic)
  (mh/unsubscribe (:conn mqtt) topic))

(defn- process-publish-channel [mqtt chan]
  (async/go (while true
        (let [v (async/<!! chan)
              t (:topic v)
              m (:message v)]
          (try
            (mh/publish (:conn mqtt) t m)
            (catch Exception e
              (println (.getLocalizedMessage e))
              (println e)))))))

(defn- process-subscribe-channel [chan]
  (async/go (while true
              (let [v (async/<!! chan)
                    t (:topic v)
                    m (:message v)
                    f ((keyword t) @topics)]
                    (f m)))))

(defn publish-scmessage [mqtt topic message]
  (publish mqtt topic message))

(defn publish-map [mqtt topic m]
  (publish mqtt topic (scm/map->SCMessage {:payload m})))

(defn http-mq-post [mqtt context]
  (let [m (:json-params context)]
    (publish-map mqtt (:topic m) (:payload m)))
  (response/ok "success"))

(defn- routes [mqtt] #{["/api/mqtt" :post
                            (conj intercept/common-interceptors (partial http-mq-post mqtt)) :route-name :http-mq-post]})

(defrecord MqttComponent [mqtt-config]
  component/Lifecycle
  (start [this]
    (let [url    (:broker-url mqtt-config)
          email  (:broker-username mqtt-config)
          token  (some-> (spacon.models.user/find-by-email {:email email})
                         first
                         get-token)
          m (connectmqtt url token)
          pub-chan (async/chan)
          sub-chan (async/chan)
          c (assoc this :conn m :publish-channel pub-chan :subscribe-channel sub-chan)]
      (process-publish-channel c pub-chan)
      (process-subscribe-channel sub-chan)
      (assoc c :routes (routes c))))
  (stop [this]
    (println "Disconnecting MQTT Client")
    (mh/disconnect (:conn this))
    (async/close! (:publish-channel this))
    (async/close! (:subscribe-channel this))
    this))

(defn make-mqtt-component [mqtt-config]
  (map->MqttComponent {:mqtt-config mqtt-config}))
