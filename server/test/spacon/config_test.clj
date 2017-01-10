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
                       (let [token (utils/authenticate "admin@something.com" "admin")
                             auth {"Authorization" (str "Token " token)}
                             read-config (utils/request-get "/api/config" auth)
                             read-res (transform-keys ->kebab-case-keyword (:result read-config))]
                         (is (some? (:forms read-res)))
                         (is (some? (:stores read-res)))))