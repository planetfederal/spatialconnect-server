(ns spacon.http.ping
  (:require [clojure.data.json :as json]
            [ring.util.response :as ring-resp]
            [spacon.http.intercept :as intercept]))

(defn- pong
  [request]
  (ring-resp/response (json/write-str {:response "pong"})))

(def routes #{["/ping" :get (conj intercept/common-interceptors `pong)]})