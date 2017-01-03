(ns spacon.team-test
  (:require [clojure.test :refer :all]
            [clojure.spec :as spec]
            [spacon.specs.team]
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

(deftest team-get-one-test []
                           (let [res (utils/request-get "/api/teams")
                                 team (utils/request-get (str "/api/teams/" (-> res :result first :id)))]
                             (is (some? team))))