(ns spacon.http.response
  (:require [camel-snake-kebab.core :refer :all]
            [camel-snake-kebab.extras :refer [transform-keys]]
            [clojure.tools.logging :as log]))

(defn is-error? [status]
  (< 300 status))

(defn make-response
  "Creates a response map using the status, body, and headers."
  [status body & {:as headers}]
  (let [res-body (assoc {}
                        :result (if (is-error? status) nil body)
                        :error (if (is-error? status) body nil))]
    (let [res {:status status :body res-body :headers headers}]
      (log/trace "Returning response" res)
      res)))

(defn make-default-response
  "Creates a response map using the status, body, and headers.
  Also transforms response body keys to be snake_case"
  [status body & {:as headers}]
  (let [b_o_d_y (transform-keys ->snake_case_keyword body)]
    (make-response status b_o_d_y)))

(def ok-without-snake-case (partial make-response 200))
(def ok (partial make-default-response 200))
(def created (partial make-default-response 201))
(def accepted (partial make-default-response 202))
(def bad-request (partial make-default-response 400))
(def unauthorized (partial make-default-response 401))
(def forbidden (partial make-default-response 403))
(def not-found (partial make-default-response 404))
(def conflict (partial make-default-response 409))
(def error (partial make-default-response 500))
(def unavailable (partial make-default-response 503))
