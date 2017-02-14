(ns spacon.components.http.config
  (:require [clojure.tools.logging :as log]
            [spacon.components.config.core :as configapi]
            [spacon.components.http.auth :refer [check-auth]]
            [spacon.components.http.intercept :as intercept]
            [spacon.components.http.response :as response]))


(defn http-get
  "Returns an http response with the config for the user"
  [config-comp request]
  (log/debug "Getting config")
  (let [d (configapi/create-config config-comp (get-in request [:identity :user]))]
    (response/ok d)))

(defn routes [config-comp] #{["/api/config" :get
                    (conj intercept/common-interceptors check-auth (partial http-get config-comp)) :route-name :get-config]})
