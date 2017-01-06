(ns spacon.device-test
  (:require [clojure.test :refer :all]            [spacon.test-utils :as utils]
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
        d (transform-keys ->snake_case_keyword device)
        new-device (utils/request-post "/api/devices" d)
        create-res (transform-keys ->kebab-case-keyword (:result new-device))
        read-device (utils/request-get (str "/api/devices/" (:identifier create-res)))
        read-res (transform-keys ->kebab-case-keyword (:result read-device))
        delete-device (utils/request-delete (str "/api/devices/" (:id create-res)))
        delete-res (transform-keys ->kebab-case-keyword (:result delete-device))]
    (is (spec/valid? :spacon.specs.device/device-spec create-res))
    (is (spec/valid? :spacon.specs.device/device-spec read-res))
    (is (= "success" delete-res))))