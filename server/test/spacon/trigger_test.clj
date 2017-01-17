(ns spacon.trigger-test
  (:require [clojure.test :refer :all]
            [spacon.components.trigger.db :as trigger]
            [spacon.test-utils :as utils]
            [spacon.specs.trigger]
            [clojure.spec :as spec]
            [clojure.spec.gen :as gen]
            [camel-snake-kebab.core :refer :all]
            [camel-snake-kebab.extras :refer [transform-keys]]))

(deftest all-trigger-test
  (is (true? (utils/spec-passed? `trigger/all))))

(use-fixtures :once utils/setup-fixtures)

(deftest trigger-get-test []
  (let [res (utils/request-get "/api/triggers")]
    (is (some? (:result res)))))

(deftest trigger-crud-test []
  (let [trigger (gen/generate (spec/gen :spacon.specs.trigger/trigger-spec))
        d (transform-keys ->snake_case_keyword trigger)
        new-trigger (utils/request-post "/api/triggers" d)
        create-res (transform-keys ->kebab-case-keyword (:result new-trigger))
        read-trigger (utils/request-get (str "/api/triggers/" (:id create-res)))
        read-res (transform-keys ->kebab-case-keyword (:result read-trigger))
        delete-trigger (utils/request-delete (str "/api/triggers/" (:id create-res)))
        delete-res (transform-keys ->kebab-case-keyword (:result delete-trigger))]
    (is (spec/valid? :spacon.specs.trigger/trigger-spec create-res))
    (is (spec/valid? :spacon.specs.trigger/trigger-spec read-res))
    (is (= "success" delete-res))))