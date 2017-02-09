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

(ns spacon.team-test
  (:require [clojure.test :refer :all]
            [clojure.spec :as spec]
            [clojure.spec.gen :as gen]
            [spacon.specs.team]
            [spacon.util.json :as jutil]
            [spacon.components.team.db :as teams]
            [camel-snake-kebab.core :refer :all]
            [camel-snake-kebab.extras :refer [transform-keys]]
            [spacon.test-utils :as utils]))

(deftest all-team-test
  (is (true? (utils/spec-passed? `teams/all))))

(use-fixtures :once utils/setup-fixtures)

(deftest team-get-test []
  (let [res (utils/request-get "/api/teams")]
    (is (some? (:result res)))))

(deftest team-crud-test []
  (let [team (gen/generate (spec/gen :spacon.specs.team/team-spec))
        t_e_a_m (transform-keys ->snake_case_keyword team)
        new-team (utils/request-post "/api/teams" t_e_a_m)
        create-res (transform-keys ->kebab-case-keyword (:result new-team))
        read-team (utils/request-get (str "/api/teams/" (:id create-res)))
        read-res (transform-keys ->kebab-case-keyword (:result read-team))
        delete-team (utils/request-delete (str "/api/teams/" (:id create-res)))
        delete-res (transform-keys ->kebab-case-keyword (:result delete-team))]
    (is (spec/valid? :spacon.specs.team/team-spec create-res))
    (is (spec/valid? :spacon.specs.team/team-spec read-res))
    (is (= "success" delete-res))))
