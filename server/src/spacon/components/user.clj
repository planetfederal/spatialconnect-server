(ns spacon.components.user
  (:require [com.stuartsierra.component :as component]
            [io.pedestal.interceptor.helpers :refer [defhandler]]
            [spacon.http.intercept :as intercept]
            [spacon.http.response :as response]
            [spacon.models.user :as usermodel]
            [spacon.http.auth :refer [check-auth]]
            [clojure.spec :as s]
            [spacon.spec :as specs]))

(defn http-get-all-users [request]
  response/ok (usermodel/all))

(defn http-create-user
  "Creates a new user"
  [request]
  (let [user (:json-params request)]
    (if (s/valid? :spacon.models.user/spec user)
      (if-let [new-user (usermodel/create user)]
        (response/ok new-user))
      (response/error (str "failed to create user:\n"
                           (s/explain-str :spacon.spec/user-spec user))))))

(defn- routes []
  #{["/api/users" :get  (conj intercept/common-interceptors `http-get-all-users)]
    ["/api/users" :post (conj intercept/common-interceptors `http-create-user)]})

(defrecord UserComponent []
  component/Lifecycle
  (start [this]
    (assoc this :routes (routes)))
  (stop [this]
    this))

(defn make-user-component []
  (->UserComponent))
