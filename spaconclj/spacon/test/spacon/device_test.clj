(ns spacon.device-test
  (:require [clojure.test :refer :all]
            [clojure.data.json :as json]
            [io.pedestal.test :refer :all]
            [io.pedestal.http :as bootstrap]
            [spacon.http.service :as service]
            [spacon.server :as server]
            [com.stuartsierra.component :as component]
            [spacon.components.device :as device]))



(deftest test-system
  (spacon.server/go)
  (let [service (get-in [:service] spacon.server/system-val)]
    (print "fooooooo")
    (print service))
  (spacon.server/stop))