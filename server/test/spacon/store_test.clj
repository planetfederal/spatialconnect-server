(ns spacon.store-test
  (:require [clojure.test :refer :all]
            [spacon.models.store :refer :all]
            [clojure.spec.test :as stest]))

(def spec-passed? (comp :result :clojure.spec.test.check/ret first stest/check))

(deftest find-store-test
  (is (true? (spec-passed? `find-store))))

(deftest store-list-test
  (is (true? (spec-passed? `store-list))))
