(ns spacon.specs.user
  (:require [clojure.spec :as s]))

;;; specs about user account data
(def email-regex #"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$")
(s/def :user/email-type (s/and string? #(re-matches email-regex %)))
(s/def :user/email :user/email-type)
(s/def :user/password string?)
(s/def :user/name string?)
(s/def ::user-spec (s/keys :req-un [:user/email :user/password]
                           :opt-un [:user/name]))
