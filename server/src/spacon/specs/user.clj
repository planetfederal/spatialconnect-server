(ns spacon.specs.user
  (:require [clojure.spec :as s]
            [spacon.util.regex :as regex]))

(s/def :user/email-type (s/and string? #(re-matches regex/email %)))
(s/def :user/email :user/email-type)
(s/def :user/password string?)
(s/def :user/name string?)
(s/def ::user-spec (s/keys :req-un [:user/email :user/password]
                           :opt-un [:user/name]))
