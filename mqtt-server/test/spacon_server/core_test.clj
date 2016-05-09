(ns mqtt-server.core-test
  (:use ring.mock.request)
  (:require [clojure.test :refer :all]
            [mqtt-server.http.handler :as handler]
            [mqtt-server.models.config :as config]
            [mqtt-server.models.stores :as store]
            [mqtt-server.models.devices :as device]
            [mqtt-server.models.forms :as form]
            [mqtt-server.models.users :as user]
            [mqtt-server.auth :as auth]
            [ring.mock.request :as mock]))

(deftest config-test
  (testing "Create Config" (let [count-orig (config/count-configs)]
                             (config/create-config "foocfg")
                             (is (not (nil? (config/find-by-name "foocfg"))))))
  (testing "Find Config By Name" (let [newname "foobarcfg"
                                       orig-cfg (config/create-config newname)
                                       query-cfg (config/find-by-name newname)]
                           (is (= (get query-cfg :group_name) newname))))

  (testing "update config" (let [query-cfg (first (config/create-config "Bar"))
                                 cfg-id (get query-cfg :id)]
                             (config/update-config cfg-id "BANANA")
                             (is (= cfg-id (get (config/find-by-name "BANANA") :id)))))

  (testing "delete config" (let [query-cfg (first (config/create-config "DELETE ME"))
                                 cfg-id (get (config/find-by-name "DELETE ME") :id)]
                             (config/delete-config cfg-id)
                             (is (nil? (config/find-by-id cfg-id)))))
  )

(deftest device-test
  (testing "create device"
    (let [cfg (first (config/config-list))
          dev (device/create-device {:name "android" :id (get cfg :id)})]
        (is (not (nil? (device/find-by-name "android"))))))
  (testing "update device"
    (let [dev (device/find-by-name "android")]
          (device/update-device (assoc dev :name "android2"))
      (is (= "android2" (-> (get dev :id)
                            (device/find-by-id)
                            (get :name))))))
  (testing "delete device" (let [d (device/find-by-name "android2")]
                             (device/delete-device (get d :id))
                             (is (nil? (device/find-by-id (get d :id)))))))

(deftest form-test
  (testing "create form" (let [cfg (first (config/config-list))
                               ff (form/create-form "test" (get cfg :id))
                               f (form/form-by-name "test")]
                           (is (not (nil? (form/form-by-id (get f :id)))))))
  (testing "update form" (let [f (form/form-by-name "test")]
                           (form/update-form (assoc f :name "test2"))
                           (is (= "test2" (-> (get f :id)
                                              (form/form-by-id)
                                              (get :name))))))
  (testing "add number" (let [f (form/form-by-name "test2")
                              item (form/add-item (get f :id) {:type "number" :label "numberfield" :required (boolean true)})]
                          (is (not (nil? (form/find-item (get item :id)))))))
  (testing "add string" (let [f (form/form-by-name "test2")
                              item (form/add-item (get f :id) {:type "string" :label "stringfield" :required (boolean true)})]
                          (is (not (nil? (form/find-item (get item :id)))))))
  (testing "add boolean" (let [f (form/form-by-name "test2")
                              item (form/add-item (get f :id) {:type "boolean" :label "booleanfield" :required (boolean true)})]
                          (is (not (nil? (form/find-item (get item :id)))))))
  (testing "add date" (let [f (form/form-by-name "test2")
                              item (form/add-item (get f :id) {:type "date" :label "datefield" :required (boolean true)})]
                          (is (not (nil? (form/find-item (get item :id)))))))
  (testing "get field" (let [f (form/form-by-name "test2")
                             i (form/formitem-by-label "datefield" (get f :id))]
                         (is (= "datefield" (get i :label)))))
  (testing "submit data" (let [f (form/form-by-name "test2")
                               cfg (first (config/config-list))
                               dev (device/create-device {:name "android" :id (get cfg :id)})
                               count-orig (form/count-form-subs (get f :id))
                               device-id (get dev :id)
                               form-id (get f :id)
                               data {:numberfield 4
                                     :stringfield "six"
                                     :booleanfield (boolean true)
                                     :datefield "2016-12-03"}
                               v (form/formdata-submit form-id device-id data)]
                           (print v)
                           (is (= (+ 4 count-orig) (form/count-form-subs (get f :id))))))

  (testing "delete form" (let [f (form/form-by-name "test2")
                                ff (form/form-by-name "test")]
                           (form/delete-form (get f :id))
                           (form/delete-form (get ff :id))
                           (device/delete-device (get (device/find-by-name "android") :id))
                           (is (nil? (form/form-by-id (get f :id)))))))


(deftest store-test
  (testing "create store"
    (let [cfg (first (config/config-list))
          store-orig (store/create-store
                       {:store_type "gpkg"
                        :version 1.0
                        :uri "http://foo.com"
                        :name "foo store"
                        :config_id (get cfg :id)})]
      (is (not (nil? store-orig)))))
  (testing "update store" (let [s (store/store-by-name "foo store")]
                            (store/update-store (assoc s :name "boo store"))
                            (is (= "boo store" (-> (get s :id)
                                                   (store/store-by-id)
                                                   (get :name)) ))))
  (testing "delete store" (let [s (store/store-by-name "boo store")]
                            (store/delete-store (get s :id))
                            (is (nil? (store/store-by-id (get s :id)))))))

(deftest test-http
  (testing "config endpoint"
    (let [response (handler/app (request :get "/config"))]
      (is (= (:status response) 200))
      (is (= (get-in response [:headers "Content-Type"]) "application/json; charset=utf-8"))))
  (testing "single config endpoint"
    (let [response (handler/app (request :get "/config/1"))]
      (is (= (:status response) 200))
      (is (= (get-in response [:headers "Content-Type"]) "application/json; charset=utf-8"))))
  (testing "store list"
    (let [response (handler/app (request :get "/config/1/store"))]
      (is (= (:status response) 200))
      (is (= (get-in response [:headers "Content-Type"]) "application/json; charset=utf-8"))))
  (testing "form list"
    (let [response (handler/app (request :get "/config/1/form"))]
      (is (= (:status response) 200))
      (is (= (get-in response [:headers "Content-Type"]) "application/json; charset=utf-8"))))
  (testing "device list"
    (let [response (handler/app (request :get "/config/1/device"))]
      (is (= (:status response) 200))
      (is (= (get-in response [:headers "Content-Type"]) "application/json; charset=utf-8")))))

(deftest authorize-users
  (let [user (user/create-user {:name "Michael Jackson" :email "abc@moonwalk.com" :password "ban8na5"})
        user-id (:id user)]
    (testing "Accepts the correct password"
      (is (user/check-password? user-id "s3cr3t")))

    (testing "Rejects incorrect passwords"
      (is (not (user/check-password? user-id "wrong pass"))))
    (user/delete-user user-id)))

(deftest authenticating-users
  (let [user (user/create-user {:name "White Fedora" :email "smooth@criminal.com" :password "ban8na"})]
    (testing "Test a valid token"
      (let [token (auth/make-token! (:id user))]
        (is (= user (auth/authenticate-token {} token)))))
    (testing "Testing an invalid token"
      (is (nil? (auth/authenticate-token {} "pandas"))))))