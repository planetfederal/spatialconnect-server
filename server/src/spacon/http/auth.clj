(ns spacon.http.auth
  (:require [io.pedestal.interceptor.chain :refer [terminate]]
            [spacon.http.intercept :as intercept]
            [spacon.http.response :as response]
            [buddy.hashers :as hashers]
            [buddy.auth.protocols :as proto]
            [buddy.auth.backends :as backends]
            [buddy.sign.jwt :as jwt]
            [clj-time.core :refer [weeks from-now]]
            [spacon.components.user.db :as usermodel]))

(defonce secret "spaconsecret")
(def auth-backend (backends/jws {:secret secret}))
(def oauth-backend (backends/jws {:secret secret :token-name "Bearer"}))

(defn get-token
  [user]
  (let [teams  (usermodel/find-teams {:user_id (:id user)})
        claims {:user (assoc user :teams teams)
                :exp  (-> 2 weeks from-now)}]
    ;; todo: encrypt the token
    (jwt/sign claims secret)))

(defn hydrate-token
  [token]
  (jwt/unsign token secret))

(defn token->user [token]
  (:user (hydrate-token token)))

(defn authenticate-user
  "Authenticate user by email and password and return a signed JWT token"
  [req]
  (let [email  (get-in req [:json-params :email])
        pwd    (get-in req [:json-params :password])
        user   (some-> (usermodel/find-by-email {:email email})
                       first)
        authn? (hashers/check pwd (:password user))]
    (if-not authn?
      (response/unauthorized "Authentication failed")
      (response/ok {:token (get-token user)}))))

(defn authorize-user
  ;; Currently, this is used by the mqtt broker to ensure that only authenticated users are able to connect to the
  ;; broker.  Eventually we will want to use this handler to ensure that a user has permission to subscribe or publish
  ;; to a specific topic.
  [request]
  (let [auth-data (try (some->> (proto/-parse oauth-backend request)
                                (proto/-authenticate oauth-backend request))
                       (catch Exception _))]
    (if (:user auth-data)
      (response/ok "User authorized!")
      (response/unauthorized "User not authorized!"))))

(def check-auth
  ;; interceptor to check for Authorization: Token <a token created from get-token>
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
    ["/api/authorize"    :post (conj intercept/common-interceptors `authorize-user)]})
