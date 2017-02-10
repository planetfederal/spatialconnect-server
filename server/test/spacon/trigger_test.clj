(ns spacon.trigger-test
  (:require [clojure.test :refer :all]
            [spacon.components.trigger.db :as trigger]
            [spacon.test-utils :as utils]
            [spacon.specs.trigger]
            [clojure.spec :as spec]
            [clojure.spec.gen :as gen]
            [camel-snake-kebab.core :refer :all]
            [camel-snake-kebab.extras :refer [transform-keys]]))

(use-fixtures :once utils/setup-fixtures)

(deftest all-trigger-test
  (is (true? (utils/spec-passed? `trigger/all))))

(defn generate-test-trigger []
  (->> (gen/generate (spec/gen :spacon.specs.trigger/trigger-spec))
       (transform-keys ->snake_case_keyword)))

(deftest trigger-http-crud-test
  (let [test-trigger (generate-test-trigger)]

    (testing "Creating a trigger through REST api produces a valid HTML response"
      (let [res (utils/request-post "/api/triggers" test-trigger)
            new-trigger (transform-keys ->kebab-case-keyword (:result res))]
        (is (contains? res :result)
            "Response should have result keyword")
        (is (spec/valid? :spacon.specs.trigger/trigger-spec new-trigger)
            "The response should contain a trigger that conforms to the trigger spec")))

    (testing "Retrieving all triggers through REST api produces a valid HTML response"
      (let [res (-> (utils/request-get "/api/triggers"))
            trigger (->> res :result first (transform-keys ->kebab-case-keyword))]
        (is (contains? res :result)
            "Response should have result keyword")
        (is (spec/valid? :spacon.specs.trigger/trigger-spec trigger)
            "The response should contain a trigger that conforms to the trigger spec")))

    (testing "Retrieving trigger by its key through REST api produces a valid HTML response"
      (let [t (-> (utils/request-get "/api/triggers") :result first)
            res (-> (utils/request-get (str "/api/triggers/" (:id t))))
            trigger (transform-keys ->kebab-case-keyword (:result res))]
        (is (contains? res :result)
            "Response should have result keyword")
        (is (spec/valid? :spacon.specs.trigger/trigger-spec trigger)
            "The response should contain a trigger that conforms to the trigger spec")))

    (testing "Updating a trigger through REST api produces a valid HTML response"
      (let [trigger (-> (utils/request-get "/api/triggers") :result first)
            renamed-trigger (->> (assoc trigger :name "foo") (transform-keys ->snake_case_keyword))
            res (utils/request-put (str "/api/triggers/" (:id trigger)) renamed-trigger)
            updated-trigger (transform-keys ->kebab-case-keyword (:result res))]
        (is (contains? res :result)
            "Response should have result keyword")
        (is (spec/valid? :spacon.specs.trigger/trigger-spec updated-trigger)
            "The response should contain a trigger that conforms to the trigger spec")
        (is (= "foo" (:name updated-trigger))
            "The response should contain the updated trigger name")))

    (testing "Deleting triggers through REST api produces a valid HTML response"
      (let [trigger (-> (utils/request-get "/api/triggers") :result first)
            res (utils/request-delete (str "/api/triggers/" (:id trigger)))]
        (is (= "success" (:result res))
            "The response should contain a success message")))))
