(ns spacon.http.response
  (:require [camel-snake-kebab.core :refer :all]
            [camel-snake-kebab.extras :refer [transform-keys]]))

(defn is-error? [status]
  (< 300 status))

(defn response [status body & {:as headers}]
  (let [b_o_d_y (transform-keys ->snake_case_keyword body)
        res-body (assoc {}
                        :result (if (is-error? status) nil b_o_d_y)
                        :error (if (is-error? status) b_o_d_y nil))]
    {:status status :body res-body :headers headers}))

(def ok (partial response 200))
(def created (partial response 201))
(def accepted (partial response 202))
(def bad-request (partial response 400))
(def unauthorized (partial response 401))
(def forbidden (partial response 403))
(def not-found (partial response 404))
(def conflict (partial response 409))
(def error (partial response 500))
(def unavailable (partial response 503))
