(ns spacon.test-utils
  (:require [clojure.spec.test :as stest]
            [spacon.server :as spacon]
            [clojure.walk :refer [keywordize-keys]]
            [io.pedestal.test :refer [response-for]]
            [clojure.data.json :as json]))

(defn spec-passed? [s] (-> (stest/check s
                                        {:clojure.spec.test.check/opts
                                         {:num-tests 50}})
                           first
                           :clojure.spec.test.check/ret
                           :result))

(defn service-def []
  (:io.pedestal.http/service-fn (:http-server (:server user/system-val))))

(defn request-get [url & [headers]]
  (let [res (response-for (service-def) :get url :headers headers)]
    (keywordize-keys (json/read-str (:body res)))))

(defn request-post [url body & [headers]]
  (let [res (response-for (service-def) :post url :body (json/write-str body)
                          :headers (merge {"Content-Type" "application/json"} headers))]
    (keywordize-keys (json/read-str (:body res)))))

(defn authenticate [user pass]
  (let [res (request-post "/api/authenticate" {:email user :password pass})]
    (get-in res [:result :token])))

(defn request-put [url body & [headers]]
  (let [res (response-for (service-def) :put url :body (json/write-str body)
                          :headers (merge {"Content-Type" "application/json"} headers))]
    (keywordize-keys (json/read-str (:body res)))))

(defn request-delete [url & [headers]]
  (let [res (response-for (service-def) :delete url :headers headers)]
    (keywordize-keys (json/read-str (:body res)))))

(defn setup-fixtures [f]
  (user/go)
  (f)
  (user/stop))