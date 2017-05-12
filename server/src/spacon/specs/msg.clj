(ns spacon.specs.msg
  (:require [clojure.spec :as s]))

(s/def ::to string?)
(s/def ::correlationId pos-int?)
(s/def ::jwt string?)
(s/def ::context #{"MOBILE"})
(s/def ::payload (s/or :empty empty? :not-empty map?))
(s/def ::action string?)

(s/def ::msg (s/keys :req-un [::to ::correlationId ::jwt
                                          ::context ::action]
                                 :opt-un [::payload]))

