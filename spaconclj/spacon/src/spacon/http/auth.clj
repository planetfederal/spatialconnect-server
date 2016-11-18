(ns spacon.http.auth
  (:require [io.pedestal.interceptor.helpers :refer [defbefore defhandler]]
            [io.pedestal.interceptor.chain :refer [terminate]]
            [spacon.http.intercept :as intercept]
            [spacon.http.response :as response]
            [buddy.hashers :as hashers]
            [buddy.auth.protocols :as proto]
            [buddy.auth.backends :as backends]
            [buddy.sign.jwt :as jwt]
            [clj-time.core :refer [weeks from-now]]
            [spacon.models.user :as user]))

(defonce secret "spaconsecret")
(def auth-backend (backends/jws {:secret secret}))

(defhandler authenticate-user
  "Authenticate user by email and password and return a signed JWT token"
  [req]
  (let [email  (get-in req [:json-params :email])
        pwd    (get-in req [:json-params :password])
        user   (some-> (user/find-by-email {:email email})
                       first)
        authn? (hashers/check pwd (:password user))]
    (if-not authn?
      (response/unauthorized "Authentication failed")
      (let [claims {:user (user/sanitize user)
                    :exp  (-> 2 weeks from-now)}
            ;; todo: encrypt the token
            token (jwt/sign claims secret)]
        (response/ok {:token token})))))


(defhandler authorize-user
  [req]
  ;; Currently, this is used by the mqtt broker to ensure that only authenticated users are able to connect to the
  ;; broker.  Eventually we will want to use this handler to ensure that a user has permission to subscribe or publish
  ;; to a specific topic
  (response/ok))


(def check-auth
  {:name :check-auth
   :enter (fn [context]
            (let [request   (:request context)
                  auth-data (try (some->> (proto/-parse auth-backend request)
                                          (proto/-authenticate auth-backend request))
                                 (catch Exception _))]
              (if (:user auth-data)
                  (assoc-in context [:request :identity] auth-data)
                  (-> context
                      terminate
                      (assoc :response {:status 401
                                        :body {:result nil
                                               :success false
                                               :error "Request failed auth check."}})))))})


(defn routes []
  #{["/api/authenticate" :post (conj intercept/common-interceptors `authenticate-user)]
    ["/api/authorize"    :post (conj intercept/common-interceptors check-auth `authorize-user)]})
