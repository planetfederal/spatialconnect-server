(ns spacon.ping-test
  (:require [clojure.test :refer :all]
            [spacon.test-utils :as utils]))

(use-fixtures :once utils/setup-fixtures)

(deftest ping-test []
  (let [res (utils/request-get "/api/ping")]
    (is (= (:result res) "pong"))))