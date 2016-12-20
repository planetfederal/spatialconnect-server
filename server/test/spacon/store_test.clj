(ns spacon.store-test
  (:require [clojure.test :refer :all]
            [spacon.components.store.db :as store]
            [spacon.test-utils :as utils]))

(deftest create-store-test
  (is (true? (utils/spec-passed? `store/create))))

(deftest store-list-test
  (is (true? (utils/spec-passed? `store/all))))
