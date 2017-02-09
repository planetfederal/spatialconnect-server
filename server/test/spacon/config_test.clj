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

(ns spacon.config-test
  (:require [clojure.test :refer :all]
            [spacon.components.form.db :as form]
            [spacon.specs.form]
            [spacon.test-utils :as utils]
            [clojure.spec.gen :as gen]
            [clojure.spec :as spec]
            [camel-snake-kebab.core :refer :all]
            [camel-snake-kebab.extras :refer [transform-keys]]))

(use-fixtures :once utils/setup-fixtures)

(deftest config-get-test []
  (let [read-config (utils/request-get "/api/config")
        read-res (transform-keys ->kebab-case-keyword (:result read-config))]
    (is (some? (:forms read-res)))
    (is (some? (:stores read-res)))))