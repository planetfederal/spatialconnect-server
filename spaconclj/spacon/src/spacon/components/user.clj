(ns spacon.components.user
  (:require [com.stuartsierra.component :as component]
            [io.pedestal.interceptor.helpers :refer [defhandler]]
            [spacon.http.intercept :as intercept]
            [spacon.models.user :as user]
            [spacon.http.auth :refer [check-auth]]
            [clojure.spec :as s]))

(defhandler get-all-users [request]
  {:status 200 :body (map user/sanitize (user/find-all))})

(defn create-user
  "Creates a new user"
  [context]
  (let [user (get-in context [:request :json-params])]
    (if (s/valid? :spacon.models.user/spec user)
      (if-let [new-user (user/add-user! user)]
        {:status 200 :body (user/sanitize new-user)})
      {:status 500 :body (str "failed to crueate user:\n" (s/explain-str :spacon.models.user/spec user))})))

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
