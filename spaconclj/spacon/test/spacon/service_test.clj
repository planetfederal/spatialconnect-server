(ns spacon.service-test
  (:require [clojure.test :refer :all]
            [clojure.data.json :as json]
            [io.pedestal.test :refer :all]
            [io.pedestal.http :as bootstrap]
            [spacon.http.service :as service]))

(def service
  (::bootstrap/service-fn (bootstrap/create-servlet service/service)))

(deftest ping
  (is (=
       (:body (response-for service :get "/ping"))
       (json/write-str {:response "pong"}))))

