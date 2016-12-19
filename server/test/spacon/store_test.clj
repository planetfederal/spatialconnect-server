(ns spacon.store-test
  (:require [clojure.test :refer :all]
            [spacon.components.store.db :as store]
            [clojure.spec.test :as stest]))

(defn spec-passed? [s] (-> (stest/check s {:clojure.spec.test.check/opts {:num-tests 25}})
                           first
                           :clojure.spec.test.check/ret
                           :result))

(deftest create-store-test
  (is (true? (spec-passed? `store/create))))

(deftest store-list-test
  (is (true? (spec-passed? `store/all))))
