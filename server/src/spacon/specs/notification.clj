(ns spacon.specs.notification
  (:require [clojure.spec :as s]
            [spacon.util.regex :as regex]
            [clojure.test.check.generators :as gen]))

; not a json validator
;(s/def :json/types (s/or :s string? :n number? :o :json/object :c :json/array))
;(s/def :json/object (s/map-of keyword? :json/types))
;(s/def :json/array (s/coll-of :json/object))
;(s/def ::json (s/or :json/array :json/object))

(s/def ::type (s/with-gen string?
                          #(s/gen #{"trigger"})))
(s/def ::payload map?)
(s/def ::title string?)
(s/def ::body string?)
(s/def ::priority (s/with-gen string?
                              #(s/gen #{"info" "alert" "background"})))

(s/def ::message (s/keys :req-un [::priority ::body ::title ::type]
                         :opt-un [::payload]))
(s/def ::devices (s/coll-of string?))
(s/def ::emails (s/coll-of #(re-matches regex/email %)))
(s/def ::recipients (s/keys :req-un [::emails ::devices]))
(s/def ::source (s/with-gen string?
                            #(s/gen #{"trigger","rest"})))
(s/def ::sent inst?)
(s/def ::delivered inst?)
(s/def :rest-response/id pos-int?)

(s/def ::rest-response (s/keys :req-un [:rest-response/id ::delivered ::sent
                                        ::source ::recipients ::message]))

(s/def ::rest-post-body (s/keys :req-un [::recipients ::message]
                                :opt-un [::source]))

(s/def ::mobile (s/keys ))