(ns spacon.organization-test
  (:require [clojure.test :refer :all]
            [spacon.models.organizations :as org]
            [clojure.spec.test :as stest]))

(defn spec-passed? [s] (-> (stest/check s {:clojure.spec.test.check/opts {:num-tests 25}})
                           first
                           :clojure.spec.test.check/ret
                           :result))

(deftest create-org-test
  (is (true? (spec-passed? `org/create))))

(deftest all-org-test
  (is (true? (spec-passed? `org/all))))
