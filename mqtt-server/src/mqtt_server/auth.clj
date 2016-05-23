(ns mqtt-server.auth
  (:use
    [mqtt-server.models.users :as user]
    [buddy.auth.backends.token :refer [token-backend]]
    [buddy.auth.accessrules :refer [success error]]
    [buddy.auth :refer [authenticated?]]
    [crypto.random :refer [base64]]))

(defn gen-session-id [] (base64 20))

(defn make-token! [user-id]
  (let [token (gen-session-id)]
    (user/insert-token {:id token :user_id user-id})
    token))

(defn authenticate-token [req token]
  (some-> (user/select-token [token])
          first
          :user_id
          user/find-by-id))

(defn unauthorized-handler [req msg]
  {:status 401
   :body {:status :error
          :message (or msg "User not authorized")}})

(def auth-backend (token-backend {:authfn authenticate-token
                                  :unauthorized-handler unauthorized-handler}))

(defn authenticated-user [req]
  (if (authenticated? req)
    true
    (error "User must be authenticated")))