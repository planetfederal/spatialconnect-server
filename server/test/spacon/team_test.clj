(ns spacon.team-test
  (:require [clojure.test :refer :all]
            [spacon.components.team.db :as teams]
            [clojure.spec.test :as stest]))

(defn spec-passed? [s]
  (-> (stest/check s
                   {:clojure.spec.test.check/opts {:num-tests 25}})
      first
      :clojure.spec.test.check/ret
      :result))

(deftest create-team-test
  (is (true? (spec-passed? `teams/create))))

(deftest modify-team-test
  (is (true? (spec-passed? `teams/modify))))

(deftest all-team-test
  (is (true? (spec-passed? `teams/all))))