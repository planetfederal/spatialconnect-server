(ns spacon.device-test
  (:require ))

(ns spacon.service-test
  (:require [clojure.test :refer :all]
            [clojure.data.json :as json]
            [io.pedestal.test :refer :all]
            [io.pedestal.http :as bootstrap]
            [spacon.http.service :as service]))