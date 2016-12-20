(ns spacon.components.user.core
  (:require [com.stuartsierra.component :as component]
            [io.pedestal.interceptor.helpers :refer [defhandler]]
            [spacon.http.intercept :as intercept]
            [spacon.http.response :as response]
            [spacon.specs.user :as user-spec]
            [spacon.components.user.db :as usermodel]
            [spacon.http.auth :refer [check-auth]]
            [clojure.spec :as s]))

(defn http-get-all-users [_]
  (response/ok (usermodel/all)))

(defn http-create-user
  "Creates a new user"
  [request]
  (let [user (:json-params request)]
    (if (s/valid? :spacon.specs.user/user-spec user)
      (if-let [new-user (usermodel/create user)]
        (response/ok new-user))
      (response/error (str "failed to create user:\n"
                           (s/explain-str :spacon.specs.user/user-spec user))))))

(defn http-create-user-team [request]
  (if-let [new-user-team (usermodel/add-user-team (:json-params request))]
    (response/ok new-user-team)
    (response/error "Failed to add user to team")))

(defn http-remove-user-team [request]
  (if-let [new-user-team (usermodel/remove-user-team (:json-params request))]
    (response/ok new-user-team)
    (response/error "Failed to remove user from team")))

(defn- routes []
  #{["/api/users" :get  (conj intercept/common-interceptors `http-get-all-users)]
    ["/api/users" :post (conj intercept/common-interceptors `http-create-user)]
    ["/api/user-team" :post (conj intercept/common-interceptors `http-create-user-team)]
    ["/api/user-team" :delete (conj intercept/common-interceptors `http-remove-user-team)]})

(defrecord UserComponent []
  component/Lifecycle
  (start [this]
    (assoc this :routes (routes)))
  (stop [this]
    this))

(defn make-user-component []
  (->UserComponent))
