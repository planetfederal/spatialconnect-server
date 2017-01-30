(ns spacon.store-test
  (:require [clojure.test :refer :all]
            [spacon.components.store.db :as store]
            [spacon.test-utils :as utils]
            [clojure.spec :as spec]
            [clojure.spec.gen :as gen]
            [camel-snake-kebab.core :refer :all]
            [camel-snake-kebab.extras :refer [transform-keys]]
            [spacon.components.mqtt.core :as mqttapi]
            [clojure.data.json :as json]
            [spacon.entity.scmessage :as scm]
            [clojure.walk :refer [keywordize-keys]])
  (:import (java.net URLEncoder URLDecoder)
           (com.boundlessgeo.spatialconnect.schema SCCommand)))

(use-fixtures :once utils/setup-fixtures)

(deftest store-list-test
  (is (true? (utils/spec-passed? `store/all))))

(defn generate-test-store []
  (->> (gen/generate (spec/gen :spacon.specs.store/store-spec))
       (transform-keys ->snake_case_keyword)))

(deftest store-http-crud-test
  (let [token (utils/authenticate "admin@something.com" "admin")
        auth {"Authorization" (str "Token " token)}
        test-store (generate-test-store)]

    (testing "Creating a store through REST api produces a valid HTML response"
      (let [res (utils/request-post "/api/stores" test-store auth)
            new-store (transform-keys ->kebab-case-keyword (:result res))]
        (is (contains? res :result)
            "Response should have result keyword")
        (is (spec/valid? :spacon.specs.store/store-spec new-store)
            "The response should contain a store that conforms to the store spec")))

    (testing "Retrieving all stores through REST api produces a valid HTML response"
      (let [res (-> (utils/request-get "/api/stores" auth))
            store (->> res :result first (transform-keys ->kebab-case-keyword))]
        (is (contains? res :result)
            "Response should have result keyword")
        (is (spec/valid? :spacon.specs.store/store-spec store)
            "The response should contain a store that conforms to the store spec")))

    (testing "Retrieving store by its key through REST api produces a valid HTML response"
      (let [s (-> (utils/request-get "/api/stores" auth) :result first)
            res (-> (utils/request-get (str "/api/stores/" (:id s)) auth))
            store (transform-keys ->kebab-case-keyword (:result res))]
        (is (contains? res :result)
            "Response should have result keyword")
        (is (spec/valid? :spacon.specs.store/store-spec store)
            "The response should contain a store that conforms to the store spec")))

    (testing "Updating a store through REST api produces a valid HTML response"
      (let [store (-> (utils/request-get "/api/stores" auth) :result first)
            renamed-store (->> (assoc store :name "foo") (transform-keys ->snake_case_keyword))
            res (utils/request-put (str "/api/stores/" (:id store)) renamed-store auth)
            updated-store (transform-keys ->kebab-case-keyword (:result res))]
        (is (contains? res :result)
            "Response should have result keyword")
        (is (spec/valid? :spacon.specs.store/store-spec updated-store)
            "The response should contain a store that conforms to the store spec")
        (is (= "foo" (:name updated-store))
            "The response should contain the updated store label")))

    (testing "Deleting stores through REST api produces a valid HTML response"
      (let [store (-> (utils/request-get "/api/stores" auth) :result first)
            res (utils/request-delete (str "/api/stores/" (:id store)) auth)]
        (is (= "success" (:result res))
            "The response should contain a success message")))

    (testing "Creating a store through REST api produces a valid message on config/update topic"
      (let [mqtt (:mqtt user/system-val)
            msg-handler (fn [name m]
                          (is (= name (get-in m [:payload :name])))
                          (is (= (.value SCCommand/CONFIG_ADD_STORE) (:action m))))]
        (mqttapi/subscribe mqtt "/config/update" (partial msg-handler (:name test-store)))
        (utils/request-post "/api/stores" test-store auth)
        (Thread/sleep 1000)))

    (testing "Updating a store through REST api produces a valid message on config/update topic"
      (let [mqtt (:mqtt user/system-val)
            store (-> (utils/request-get "/api/stores" auth) :result first)
            updated-store (->> (assoc store :name "foo") (transform-keys ->snake_case_keyword))
            msg-handler (fn [id m]
                          (is (= id (get-in m [:payload :id])))
                          (is (= (.value SCCommand/CONFIG_UPDATE_STORE) (:action m))))]
        (mqttapi/subscribe mqtt "/config/update" (partial msg-handler (:id store)))
        (utils/request-put (str "/api/stores/" (:id store)) updated-store auth)
        (Thread/sleep 1000)))

    (testing "Deleting a store through REST api produces a valid message on config/update topic"
      (let [mqtt (:mqtt user/system-val)
            store (-> (utils/request-get "/api/stores" auth) :result first)
            msg-handler (fn [id m]
                          (is (= id (get-in m [:payload :id])))
                          (is (= (.value SCCommand/CONFIG_REMOVE_STORE) (:action m))))]
        (mqttapi/subscribe mqtt "/config/update" (partial msg-handler (:id store)))
        (utils/request-delete (str "/api/stores/" (:id store)) auth)
        (Thread/sleep 1000)))))

(deftest wfs-get-caps-proxy
  (testing "Sending a request to /api/wfs/getCapabilities?url=<wfs-endpoint> returns a list of layernames"
    (let [token (utils/authenticate "admin@something.com" "admin")
          auth {"Authorization" (str "Token " token)}
          wfs-url (URLEncoder/encode "http://demo.boundlessgeo.com/geoserver/osm/ows" "UTF-8")
          res (utils/request-get (str "/api/wfs/getCapabilities?url=" wfs-url) auth)]
      (is (< 0 (count (:result res)))
          "The response should contain a list of layers in the result"))))

(defn generate-invalid-store
  []
  (gen/generate (gen/any)))

(deftest test-invalid-store-crud
  (let [token (utils/authenticate "admin@something.com" "admin")
        auth {"Authorization" (str "Token " token)}]

    (testing "The REST api prevents invalid stores from being created or updated"
      (let [f (generate-invalid-store)
            res (utils/get-response-for :post "/api/stores" f auth)
            body (-> res :body json/read-str keywordize-keys)]
        (is (contains? body :error)
            "The response body should contain an error message")
        (is (= 400 (:status res))
            "The response code should be 400")))

    (testing "The REST api returns a 404 Not Found error for a GET request with an invalid store id"
      (let [res (utils/get-response-for :get (str "/api/stores/" 0) {} auth)
            body (-> res :body json/read-str keywordize-keys)]
        (is (contains? body :error)
            "The response body should contain an error message")
        (is (= 404 (:status res))
            "The response code should be 404")))

    (testing "The REST api responds with error when trying to delete and invalid store"
      (let [invalid-store-id (gen/generate (gen/string-alphanumeric))
            res (utils/get-response-for :delete (str "/api/stores/" invalid-store-id) {} auth)
            body (-> res :body json/read-str keywordize-keys)]
        (is (contains? body :error)
            "The response body should contain an error message")
        (is (= 400 (:status res))
            "The response code should be 400")))))

(deftest invalid-wfs-url-returns-no-layers
  (testing "Sending an invalid wfs endpoint to /api/wfs/getCapabilities returns an error"
    (let [token (utils/authenticate "admin@something.com" "admin")
          auth {"Authorization" (str "Token " token)}
          wfs-url (URLEncoder/encode "http://invalid.boundlessgeo.com/geoserver/osm/ows" "UTF-8")
          res (utils/get-response-for :get (str "/api/wfs/getCapabilities?url=" wfs-url) {} auth)
          body (-> res :body json/read-str keywordize-keys)]
      (is (contains? body :error)
          "The response body should contain an error message")
      (is (= 400 (:status res))
          "The response code should be 400"))))
