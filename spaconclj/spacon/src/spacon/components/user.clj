(ns spacon.components.user
  (:require [com.stuartsierra.component :as component]
            [io.pedestal.interceptor.helpers :refer [defhandler]]
            [spacon.http.intercept :as intercept]
            [buddy.hashers :as hashers]
            [spacon.models.user :as user]
            [spacon.http.auth :refer [check-auth]]
            [clojure.spec :as s]))

(defhandler get-all-users [request]
  {:status 200 :body (map user/sanitize (user/find-all))})

(defhandler create-user
  [req]
  (let [u (:json-params req)]
    (if (s/valid? :spacon.models.user/spec u)
      (if-let [new-user (user/create<! {:name     (:name u)
                                        :email    (:email u)
                                        :password (hashers/derive (:password u))})]
        {:status 200 :body (user/sanitize new-user)}
        {:status 500 :body (str "failed to create user" (s/explain-str :spacon.models.users/spec u))}))))

(defn- routes []
  #{["/api/users" :get  (conj intercept/common-interceptors `get-all-users)]
    ["/api/users" :post (conj intercept/common-interceptors `create-user)]})

(defrecord UserComponent []
  component/Lifecycle
  (start [this]
    (assoc this :routes (routes)))
  (stop [this]
    this))

(defn make-user-component []
  (->UserComponent))
