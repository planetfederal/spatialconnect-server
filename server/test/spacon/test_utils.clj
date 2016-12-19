(ns spacon.test-utils
  (:require [clojure.spec.test :as stest]))

(defn spec-passed? [s] (-> (stest/check s
                                        {:clojure.spec.test.check/opts
                                         {:num-tests 25}})
                           first
                           :clojure.spec.test.check/ret
                           :result))

