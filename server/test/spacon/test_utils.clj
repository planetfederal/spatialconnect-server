(ns spacon.test-utils
  (:require [clojure.spec.test :as stest]
            [spacon.server :refer [make-spacon-server]]
            [com.stuartsierra.component :as component]
            [clj-http.client :as client]
            [clojure.walk :refer [keywordize-keys]]
            [io.pedestal.http :as server]
            [io.pedestal.test :refer [response-for]]
            [clojure.data.json :as json]))

(defn spec-passed? [s] (-> (stest/check s
                                        {:clojure.spec.test.check/opts
                                         {:num-tests 50}})
                           first
                           :clojure.spec.test.check/ret
                           :result))

(def system-val nil)

(defn service-def []
  (:io.pedestal.http/service-fn (:http-server (:server system-val))))

(defn init-dev []
  (make-spacon-server {:http-config {:env                     :dev
                                     ::server/join?           false
                                     ::server/allowed-origins {:creds true
                                                               :allowed-origins (constantly true)}}
                       :mqtt-config {:broker-url (or (System/getenv "MQTT_BROKER_URL")
                                                     "tcp://localhost:1883")}}))

(defn init []
  (alter-var-root #'system-val (constantly (init-dev))))

(defn start []
  (alter-var-root #'system-val component/start-system))

(defn stop []
  (alter-var-root #'system-val
                  (fn [s] (when s (component/stop-system s)))))

(defn go []
  (init)
  (start))

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
  (go)
  (f)
  (stop))