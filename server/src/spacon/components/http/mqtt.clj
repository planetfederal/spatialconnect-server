(ns spacon.components.http.mqtt
  (:require [spacon.components.http.intercept :as intercept]
            [spacon.components.http.response :as response]
            [spacon.components.mqtt.core :as mqttapi]))

(defn http-mq-post [mqtt context]
  (let [m (:json-params context)]
    (mqttapi/publish-map mqtt (:topic m) (:payload m)))
  (response/ok "success"))

(defn routes [mqtt] #{["/api/mqtt" :post
                       (conj intercept/common-interceptors (partial http-mq-post mqtt)) :route-name :http-mq-post]})
