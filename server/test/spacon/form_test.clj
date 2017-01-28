(ns spacon.form-test
  (:require [clojure.test :refer :all]
            [spacon.components.form.core :refer :all]
            [spacon.components.form.db :as form]
            [spacon.specs.form]
            [spacon.test-utils :as utils]
            [clojure.spec.gen :as gen]
            [clojure.spec :as spec]
            [camel-snake-kebab.core :refer :all]
            [camel-snake-kebab.extras :refer [transform-keys]]
            [spacon.components.mqtt.core :as mqttapi]
            [clojure.data.json :as json]
            [spacon.entity.scmessage :as scm]
            [clojure.walk :refer [keywordize-keys]])
  (:import java.net.URLDecoder
           (com.boundlessgeo.spatialconnect.schema SCCommand)))


(use-fixtures :once utils/setup-fixtures)

(defn generate-test-form []
  (->> (gen/generate (spec/gen :spacon.specs.form/form-spec))
       (transform-keys ->snake_case_keyword)))

(deftest form-list-test
  (is (true? (utils/spec-passed? `form/all))))

(deftest form-http-crud-test
  (let [token (utils/authenticate "admin@something.com" "admin")
        auth {"Authorization" (str "Token " token)}
        test-form (generate-test-form)]

    (testing "Creating a form through REST api produces a valid HTML response"
      (let [res (utils/request-post "/api/forms" test-form auth)
            new-form (transform-keys ->kebab-case-keyword (:result res))]
        (is (contains? res :result)
            "Response should have result keyword")
        (is (spec/valid? :spacon.specs.form/form-spec new-form)
            "The response should contain a form that conforms to the form spec")))

    (testing "Retrieving all forms through REST api produces a valid HTML response"
      (let [res (-> (utils/request-get "/api/forms" auth))
            form (->> res :result first (transform-keys ->kebab-case-keyword))]
        (is (contains? res :result)
            "Response should have result keyword")
        (is (spec/valid? :spacon.specs.form/form-spec form)
            "The response should contain a form that conforms to the form spec")))

    (testing "Retrieving form by its key through REST api produces a valid HTML response"
      (let [f (-> (utils/request-get "/api/forms" auth) :result first)
            res (-> (utils/request-get (str "/api/forms/" (:form_key f)) auth))
            form (transform-keys ->kebab-case-keyword (:result res))]
        (is (contains? res :result)
            "Response should have result keyword")
        (is (spec/valid? :spacon.specs.form/form-spec form)
            "The response should contain a form that conforms to the form spec")))

    (testing "Updating a form through REST api produces a valid HTML response"
      (let [form (-> (utils/request-get "/api/forms" auth) :result first)
            renamed-form (->> (assoc form :form-label "foo") (transform-keys ->snake_case_keyword))
            res (utils/request-post "/api/forms" renamed-form auth)
            updated-form (transform-keys ->kebab-case-keyword (:result res))]
        (is (contains? res :result)
            "Response should have result keyword")
        (is (spec/valid? :spacon.specs.form/form-spec updated-form)
            "The response should contain a form that conforms to the form spec")
        (is (= "foo" (:form-label updated-form))
            "The response should contain the updated form label")))

    (testing "Deleting forms through REST api produces a valid HTML response"
      (let [form-to-delete (generate-test-form)]
        ;; first create the form that needs to be deleted
        (utils/request-post "/api/forms" form-to-delete auth)
        (let [res (utils/request-delete (str "/api/forms/" (:form_key form-to-delete)) auth)]
          (is (= "success" (:result res))
              "The response should contain a success message"))))

    (testing "Creating a form through REST api produces a valid message on config/update topic"
      (let [mqtt (:mqtt user/system-val)
            msg-handler (fn [form-key m]
                          (is (= form-key (get-in m [:payload :form-key])))
                          (is (= (.value SCCommand/CONFIG_ADD_FORM) (:action m))))]
        (mqttapi/subscribe mqtt "/config/update" (partial msg-handler (:form_key test-form)))
        (utils/request-post "/api/forms" test-form auth)
        (Thread/sleep 1000)))

    (testing "Updating a form through REST api produces a valid message on config/update topic"
      (let [mqtt (:mqtt user/system-val)
            form (-> (utils/request-get "/api/forms" auth) :result first)
            updated-form (->> (assoc form :form-label "foo") (transform-keys ->snake_case_keyword))
            msg-handler (fn [form-key m]
                          (is (= form-key (get-in m [:payload :form-key])))
                          ;; todo: we never update a form...we only add new ones with a newer version
                          (is (= (.value SCCommand/CONFIG_ADD_FORM) (:action m))))]
        (mqttapi/subscribe mqtt "/config/update" (partial msg-handler (:form_key updated-form)))
        (utils/request-post "/api/forms" updated-form auth)
        (Thread/sleep 1000)))

    (testing "Deleting a form through REST api produces a valid message on config/update topic"
      (let [mqtt (:mqtt user/system-val)
            form (-> (utils/request-get "/api/forms" auth) :result first)
            msg-handler (fn [form-key m]
                          (is (= form-key (get-in m [:payload :form-key])))
                          (is (= (.value SCCommand/CONFIG_REMOVE_FORM) (:action m))))]
        (mqttapi/subscribe mqtt "/config/update" (partial msg-handler (:form_key form)))
        (utils/request-delete (str "/api/forms/" (:form_key form)) auth)
        (Thread/sleep 1000)))))



(deftest form-data-submission-test
  (let [token (utils/authenticate "admin@something.com" "admin")
        auth {"Authorization" (str "Token " token)}]

    (testing "Submitting form data through REST api produces a valid HTML response"
      (let [id (-> (utils/request-get "/api/forms" auth) :result first :id)
            res (utils/request-post (format "/api/form/%s/submit" id) {:test "data"} auth)]
        (is (= "data submitted successfully" (:result res))
            "The response should contain a success message")))

    (testing "Retrieving form data through REST api produces a valid HTML response"
      (let [id (-> (utils/request-get "/api/forms" auth) :result first :id)
            res (utils/request-get (format "/api/form/%s/results" id) auth)]
        (is (<= 0 (count (:result res)))
            "The response should contain a success message")))

    (testing "Submitting form data through MQTT /store/form topic persists a new row to the db"
      (let [mqtt (:mqtt user/system-val)
            id (-> (utils/request-get "/api/forms" auth) :result first :id)
            feature (gen/generate (spec/gen :spacon.specs.geojson/feature-spec))
            form-data {:form_id id :feature feature}
            m (scm/map->SCMessage {:action (.value SCCommand/DATASERVICE_CREATEFEATURE)
                                   :payload form-data})]
        (mqttapi/publish-scmessage mqtt "/store/form" m)
        (Thread/sleep 1000)
        (let [res (utils/request-get (format "/api/form/%s/results" id) auth)
              submissions (doall (map #(get % :val) (:result res)))
              feature-ids (doall (map #(get % :id) submissions))]
          (is (not (empty? (filter #(= (:id feature) %) feature-ids)))
              "The submitted feature should be in the response"))))))


(defn generate-invalid-form
  []
  (gen/generate (gen/any)))

(deftest test-invalid-form-crud
  (let [token (utils/authenticate "admin@something.com" "admin")
        auth {"Authorization" (str "Token " token)}]

    (testing "The REST api prevents invalid forms from being created or updated"
      (let [f (generate-invalid-form)
            res (utils/get-response-for :post "/api/forms" f auth)
            body (-> res :body json/read-str keywordize-keys)]
        (is (contains? body :error)
            "The response body should contain an error message")
        (is (= 400 (:status res))
            "The response code should be 400")))

    (testing "The REST api responds with error when trying to delete and invalid form"
      (let [invalid-form-key (gen/generate (gen/string-alphanumeric))
            res (utils/get-response-for :delete (str "/api/forms/" invalid-form-key) {} auth)
            body (-> res :body json/read-str keywordize-keys)]
        (is (contains? body :error)
            "The response body should contain an error message")
        (is (= 400 (:status res))
            "The response code should be 400")))))

