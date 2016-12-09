(ns spacon.trigger-test
  (:require [clojure.test :refer :all]
            [spacon.models.triggers :as trigger]
            [clojure.spec.test :as stest]))

(defn spec-passed?
  [s]
  (-> (stest/check s
                   {:clojure.spec.test.check/opts {:num-tests 25}})
      first
      :clojure.spec.test.check/ret
      :result))

(deftest create-trigger-test
  (is (true? (spec-passed? `trigger/create))))

(deftest all-trigger-test
  (is (true? (spec-passed? `trigger/all))))
