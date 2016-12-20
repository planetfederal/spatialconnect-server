(ns spacon.form-test
  (:require [clojure.test :refer :all]
            [spacon.components.form.db :as form]
            [spacon.test-utils :as utils]
            [clojure.spec.test :as stest]))

(deftest create-form-test
  (is (true? (utils/spec-passed? `form/add-form-with-fields))))

(deftest form-list-test
  (is (true? (utils/spec-passed? `form/all))))
