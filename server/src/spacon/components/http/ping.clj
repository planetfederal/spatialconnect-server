(ns spacon.components.http.ping
  (:require [spacon.components.http.response :as response]
            [spacon.components.http.intercept :as intercept]
            [clojure.core.async :as async]
            [clojure.data.json :as json]
            [spacon.components.queue.protocol :as queueapi]))

(defn- pong
  "Responds with pong as a way to ensure http service is reachable"
  [_]
  (response/ok "pong"))

(defn pong-queue
  "Subscribes to test topic and awaits pong message to ensure queue cluster is reachable"
  [queue-comp request]
  (let [record {:topic "test"
                :key   "anykey"
                :value (json/write-str (:json-params request))}
        promise-chan (queueapi/publish queue-comp record)
        [val _] (async/alts!! [promise-chan (async/timeout 2000)])]
    (if (nil? val)
      (response/error "Error writing to queue or timeout")
      (response/ok val))))

(defn routes
  [queue-comp]
  #{["/api/ping/queue" :post (conj intercept/common-interceptors (partial pong-queue queue-comp)) :route-name :pong-queue]})
