(ns spacon.tests.store
  (:require [clojure.test :refer :all]
            [clojure.test.check.generators :as gen]
            [clojure.spec.test :as stest]))

(def spec-passed? (comp :result :clojure.spec.test.check/ret first stest/check))

(deftest get-store-test
  (stest/check `spacon.models.store/find-store))
