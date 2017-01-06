(ns spacon.form-test
  (:require [clojure.test :refer :all]
            [spacon.components.form.db :as form]
            [spacon.specs.form]
            [spacon.test-utils :as utils]
            [clojure.spec.gen :as gen]
            [clojure.spec :as spec]
            [camel-snake-kebab.core :refer :all]
            [camel-snake-kebab.extras :refer [transform-keys]]))

(deftest form-list-test
  (is (true? (utils/spec-passed? `form/all))))

(use-fixtures :once utils/setup-fixtures)

(deftest form-get-test []
                       (let [res (utils/request-get "/api/forms")]
                         (is (some? (:result res)))))

(deftest form-crud-test []
                        (let [token (utils/authenticate "admin@something.com" "admin")
                              auth {"Authorization" (str "Token " token)}
                              form (transform-keys ->snake_case_keyword
                                                   (gen/generate (spec/gen :spacon.specs.form/form-spec)))
                              new-form (utils/request-post "/api/forms" form auth)
                              create-res (transform-keys ->kebab-case-keyword (:result new-form))
                              read-form (utils/request-get (str "/api/forms/" (:form-key create-res)) auth)
                              read-res (transform-keys ->kebab-case-keyword (:result read-form))
                              update-form (utils/request-post "/api/forms"
                                                              (transform-keys ->snake_case_keyword
                                                                              (assoc read-res
                                                                                :form-label "foo"
                                                                                )) auth)
                              update-res (transform-keys ->kebab-case-keyword (:result update-form))
                              delete-form (utils/request-delete (str "/api/forms/" (:form-key create-res)) auth)
                              delete-res (transform-keys ->kebab-case-keyword (:result delete-form))]
                          (is (spec/valid? :spacon.specs.form/form-spec create-res))
                          (is (spec/valid? :spacon.specs.form/form-spec read-res))
                          (is (spec/valid? :spacon.specs.form/form-spec update-res))
                          (is (= "foo" (:form-label update-res)))
                          (is (= "success" delete-res))))