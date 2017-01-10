(ns spacon.http.intercept
  (:require [clojure.data.json :as json]
            [spacon.http.response :as response]
            [io.pedestal.http.body-params :as body-params]
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
    "text/html"        (json/write-str body)
    "text/plain"       (json/write-str body)
    "application/edn"  (pr-str body)
    "application/json" (json/write-str body)))

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

(def common-interceptors [coerce-body content-neg-intc (body-params/body-params)])