;; Copyright 2016-2017 Boundless, http://boundlessgeo.com
;;
;; Licensed under the Apache License, Version 2.0 (the "License");
;; you may not use this file except in compliance with the License.
;; You may obtain a copy of the License at
;;
;; http://www.apache.org/licenses/LICENSE-2.0
;;
;; Unless required by applicable law or agreed to in writing, software
;; distributed under the License is distributed on an "AS IS" BASIS,
;; WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
;; See the License for the specific language governing permissions and
;; limitations under the License.

(ns spacon.http.intercept
  (:require [clojure.data.json :as json]
            [spacon.http.response :as response]
            [io.pedestal.http.body-params :as body-params]
            [camel-snake-kebab.core :refer :all]
            [camel-snake-kebab.extras :refer [transform-keys]]
            [io.pedestal.http.content-negotiation :as conneg]))

(extend-type java.sql.Timestamp
  clojure.data.json/JSONWriter
  (-write [date out]
    (clojure.data.json/-write (str date) out)))

(extend-type java.util.UUID
  clojure.data.json/JSONWriter
  (-write [uuid out]
    (clojure.data.json/-write (str uuid) out)))

(def supported-types ["text/html" "application/edn" "application/json" "text/plain"])

(def content-neg-intc (conneg/negotiate-content supported-types))

(defn accepted-type
  [context]
  (get-in context [:request :accept :field] "application/json"))

(defn transform-content
  [body content-type]
  (case content-type
    "text/html" (json/write-str body)
    "text/plain" (json/write-str body)
    "application/edn" (pr-str body)
    "application/json" (json/write-str body)))

(def kebab-keys
  {:name  ::kebab-keys
   :enter (fn [context]
            (if-not (nil? (get-in context [:request :json-params]))
              (update-in context [:request :json-params] #(transform-keys ->kebab-case-keyword %))
              context))})

(def camel-keys
  {:name  ::camel-keys
   :leave (fn [context]
            (if-not (nil? (get-in context [:response :body :result]))
              (update-in context [:response :body :result] #(transform-keys ->snake_case_keyword %))
              context))})

; always set response content-type to json
(defn coerce-to
  [response content-type]
  (-> response
      (update :body transform-content content-type)
      (assoc-in [:headers "Content-Type"] "application/json")))

(def coerce-body
  {:name ::coerce-body
   :leave
   (fn [context]
     (cond-> context
       (nil? (get-in context [:response :body :headers "Content-Type"]))
       (update-in [:response] coerce-to (accepted-type context))))})

(def common-interceptors [coerce-body content-neg-intc (body-params/body-params) kebab-keys])