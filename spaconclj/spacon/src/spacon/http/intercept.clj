(ns spacon.http.intercept
  (:require [clojure.data.json :as json]
            [io.pedestal.http.body-params :as body-params]
            [io.pedestal.http.content-negotiation :as conneg]))

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

(defn coerce-to
  [response content-type]
  (-> response
      (update :body transform-content content-type)
      (assoc-in [:headers "Content-Type"] content-type)))

(def coerce-body
  {:name ::coerce-body
   :leave
         (fn [context]
           (cond-> context
                   (nil? (get-in context [:response :body :headers "Content-Type"]))
                   (update-in [:response] coerce-to (accepted-type context))))})

(defn response [status body & {:as headers}]
  (let [res-body (assoc-in {:result body} [:result :success] (> 300 status))]
    {:status status :body res-body :headers headers}))

(def ok (partial response 200))
(def created (partial response 201))
(def accepted (partial response 202))

(def entity-render
  {:name :entity-render
   :leave (fn [context]
            (if-let [item (:result context)]
              (assoc context :response (ok item "Content-Type" "application/json"))
              context))})

(def common-interceptors [entity-render coerce-body content-neg-intc (body-params/body-params)])