(ns spacon.device-test
  (:require [clojure.test :refer :all]
            [clojure.spec :as s]
            [clojure.spec.test :as stest]
            [spacon.server :as server]
            [com.stuartsierra.component :as component]
            [spacon.test-utils :as utils]
            [clj-http.client :as client]
            [clojure.data.json :as json]))

(deftest all-device-test
  (is (true? (utils/spec-passed? 'spacon.components.device.db/all))))

(deftest device-list-testing []
                             (test/response-for ()))

(deftest device-list-test
  []
  (let [res (client/get "http://localhost:8085/api/devices")]
    (is (some? (json/read-str (:body res))))))
