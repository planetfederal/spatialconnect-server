(ns spacon.organization-test
  (:require [clojure.test :refer :all]
            [spacon.components.organization.db :as org]
            [spacon.test-utils :as utils]
            [clojure.spec.test :as stest]))

(deftest create-org-test
  (is (true? (utils/spec-passed? `org/create))))

(deftest all-org-test
  (is (true? (utils/spec-passed? `org/all))))
