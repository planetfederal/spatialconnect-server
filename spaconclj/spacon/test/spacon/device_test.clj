(ns spacon.device-test
    (:require [clojure.test :refer :all]
              [clojure.spec :as s]
              [clojure.spec.test :as stest]))

(def spec-passed? (comp :result :clojure.spec.test.check/ret first stest/check))

(deftest create-device-test
  (is (true? (spec-passed? `spacon.components.device/create-device))))

(deftest update-device-test
   (is (true? (spec-passed? `spacon.components.device/update-device))))

;(deftest all-device-tests
;  (is (true? (spec-passed? (stest/enumerate-namespace 'spacon.components.device)))))
