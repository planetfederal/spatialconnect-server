(ns spacon.components.user
  (:require [com.stuartsierra.component :as component]
            [io.pedestal.interceptor.helpers :refer [defhandler]]
            [spacon.http.intercept :as intercept]
            [spacon.http.response :as response]
            [spacon.models.user :as user]
            [spacon.http.auth :refer [check-auth]]
            [clojure.spec :as s]))

(defn get-all-users [request]
  (response/ok (map user/sanitize (user/find-all))))

(defn create-user
  "Creates a new user"
  [request]
  (let [user (:json-params request)]
    (if (s/valid? :spacon.models.user/spec user)
      (if-let [new-user (user/add-user! user)]
        (response/ok (user/sanitize new-user)))
      (response/error (str "failed to crueate user:\n" (s/explain-str :spacon.models.user/spec user))))))

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
