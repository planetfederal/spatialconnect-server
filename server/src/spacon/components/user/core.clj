(ns spacon.components.user.core
  (:require [com.stuartsierra.component :as component]
            [io.pedestal.interceptor.helpers :refer [defhandler]]
            [spacon.http.intercept :as intercept]
            [spacon.http.response :as response]
            [spacon.specs.user :as user-spec]
            [spacon.components.user.db :as usermodel]
            [spacon.http.auth :refer [check-auth]]
            [clojure.spec :as s]
            [clojure.tools.logging :as log]))

(defn http-get-all-users
  "Returns http response for all users"
  [_]
  (log/debug "Getting all users")
  (response/ok (usermodel/all)))

(defn http-post-user
  "Creates a new user"
  [request]
  (log/debug "Validating user")
  (let [user (:json-params request)]
    (if (s/valid? :spacon.specs.user/user-spec user)
      (if-let [new-user (usermodel/create user)]
        (response/ok new-user))
      (let [reason  (s/explain-str :spacon.specs.user/user-spec user)
            err-msg (format "Failed to create new user %s because %s" user reason)]
        (log/error err-msg)
        (response/error err-msg)))))

(defn http-post-user-team
  "Adds a user to a team"
  [request]
  (log/debug "Adding user to team")
  (if-let [new-user-team (usermodel/add-user-team (:json-params request))]
    (response/ok new-user-team)
    (let [err-msg "Failed to add user to team"]
      (log/error err-msg)
      (response/error err-msg))))

(defn http-remove-user-team
  "Removes a user from a team"
  [request]
  (log/debug "Removing user from team")
  (if-let [new-user-team (usermodel/remove-user-team (:json-params request))]
    (response/ok new-user-team)
    (let [err-msg "Failed to remove user from team"]
      (log/error err-msg)
      (response/error err-msg))))

(defn- routes []
  #{["/api/users" :get  (conj intercept/common-interceptors `http-get-all-users)]
    ["/api/users" :post (conj intercept/common-interceptors `http-post-user)]
    ["/api/user-team" :post (conj intercept/common-interceptors `http-post-user-team)]
    ["/api/user-team" :delete (conj intercept/common-interceptors `http-remove-user-team)]})

(defrecord UserComponent []
  component/Lifecycle
  (start [this]
    (log/debug "Starting User Component")
    (assoc this :routes (routes)))
  (stop [this]
    (log/debug "Stopping User Component")
    this))

(defn make-user-component []
  (->UserComponent))
