(ns spacon.device-test
  (:require [clojure.test :refer :all]
            [clojure.spec :as s]
            [clojure.spec.test :as stest]
            [spacon.server :as server]
            [com.stuartsierra.component :as component]
            [spacon.test-utils :as utils]))

(deftest create-device-test
  (is (true? (utils/spec-passed? 'spacon.components.device.db/create))))

(deftest all-device-test
  (is (true? (utils/spec-passed? 'spacon.components.device.db/all))))