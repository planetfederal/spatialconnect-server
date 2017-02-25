;; Copyright 2016-2017 Boundless, http://boundlessgeo.com
;;
;; Licensed under the Apache License, Version 2.0 (the "License");
;; you may not use this file except in compliance with the License.
;; You may obtain a copy of the License at
;;
;; http://www.apache.org/licenses/LICENSE-2.0
;;
;; Unless required by applicable law or agreed to in writing, software
;; distributed under the License is distributed on an "AS IS" BASIS,
;; WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
;; See the License for the specific language governing permissions and
;; limitations under the License.

(ns spacon.device-test
  (:require [clojure.test :refer :all]
            [spacon.test-utils :as utils]
            [camel-snake-kebab.core :refer :all]
            [camel-snake-kebab.extras :refer [transform-keys]]
            [clojure.spec.gen :as gen]
            [clojure.spec :as spec]))

(deftest all-device-test
  (is (true? (utils/spec-passed? 'spacon.components.device.db/all))))

(use-fixtures :once utils/setup-fixtures)

(deftest device-get-test []
  (let [res (utils/request-get "/api/devices")]
    (is (some? (:result res)))))

(deftest device-crud-test []
  (let [device (gen/generate (spec/gen :spacon.specs.device/device-spec))
        d device
        new-device (utils/request-post "/api/devices" d)
        create-res (:result new-device)
        read-device (utils/request-get (str "/api/devices/" (:identifier create-res)))
        read-res (:result read-device)
        delete-device (utils/request-delete (str "/api/devices/" (:id create-res)))
        delete-res (:result delete-device)]
    (is (spec/valid? :spacon.specs.device/device-spec create-res))
    (is (spec/valid? :spacon.specs.device/device-spec read-res))
    (is (= "success" delete-res))))