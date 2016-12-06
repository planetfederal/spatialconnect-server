(ns spacon.device-test
  (:require [clojure.test :refer :all]
            [clojure.spec :as s]
            [clojure.spec.test :as stest]
            [spacon.server :as server]
            [com.stuartsierra.component :as component]))

(defn spec-passed? [s] (-> (stest/check s {:clojure.spec.test.check/opts {:num-tests 25}})
                           first
                           :clojure.spec.test.check/ret
                           :result))

(deftest create-device-test
  (is (true? (spec-passed? 'spacon.models.devices/create))))

(deftest update-device-test
  (is (true? (spec-passed? 'spacon.models.devices/update))))

(deftest all-device-tests
  (is (true? (spec-passed? (stest/enumerate-namespace 'spacon.models.devices)))))
