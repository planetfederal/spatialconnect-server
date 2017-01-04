(ns spacon.store-test
  (:require [clojure.test :refer :all]
            [spacon.components.store.db :as store]
            [spacon.test-utils :as utils]
            [clojure.spec :as spec]
            [clojure.spec.gen :as gen]
            [camel-snake-kebab.core :refer :all]
            [camel-snake-kebab.extras :refer [transform-keys]]))

(deftest store-list-test
  (is (true? (utils/spec-passed? `store/all))))

(use-fixtures :once utils/setup-fixtures)

(deftest store-get-test []
  (let [res (utils/request-get "/api/stores")]
    (is (some? (:result res)))))

(deftest store-crud-test []
  (let [token (utils/authenticate "admin@something.com" "admin")
        auth {"Authorization" (str "Token " token)}
        store (gen/generate (spec/gen :spacon.specs.store/store-spec))
        t_e_a_m (transform-keys ->snake_case_keyword store)
        new-store (utils/request-post "/api/stores" t_e_a_m auth)
        create-res (transform-keys ->kebab-case-keyword (:result new-store))
        read-store (utils/request-get (str "/api/stores/" (:id create-res)) auth)
        read-res (transform-keys ->kebab-case-keyword (:result read-store))
        delete-store (utils/request-delete (str "/api/stores/" (:id create-res)) auth)
        delete-res (transform-keys ->kebab-case-keyword (:result delete-store))]
    (is (spec/valid? :spacon.specs.store/store-spec create-res))
    (is (spec/valid? :spacon.specs.store/store-spec read-res))
    (is (= "success" delete-res))))