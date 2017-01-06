(ns spacon.trigger-test
  (:require [clojure.test :refer :all]
            [spacon.components.trigger.db :as trigger]
            [spacon.test-utils :as utils]))

(deftest all-trigger-test
  (is (true? (utils/spec-passed? `trigger/all))))
