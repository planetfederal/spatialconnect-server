(ns spacon.specs.trigger
  (:require [clojure.spec :as s]
            [spacon.specs.geojson :as geojson-spec]))

(s/def :trigger/comparator-spec (s/with-gen
                                  (s/and string? #(contains? #{"$geowithin"} %))
                                  #(s/gen #{"$geowithin"})))

;;; spec for trigger
(s/def :trigger/name string?)
(s/def :trigger/description string?)
(s/def :trigger/stores (s/coll-of string?))
(s/def :trigger/emails (s/coll-of string?))
(s/def :trigger/devices (s/coll-of string?))
(s/def :trigger/recipients (s/keys :req-un [:trigger/emails :trigger/devices]))
(s/def :trigger/lhs (s/coll-of string?))
(s/def :trigger/comparator :trigger/comparator-spec)
(s/def :trigger/rhs :spacon.specs.geojson/featurecollectionpolygon-spec)
(s/def :trigger/rule (s/keys :req-un [:trigger/lhs :trigger/comparator :trigger/rhs]))
(s/def :trigger/rules (s/coll-of (s/or :no-rules empty? :some-rules :trigger/rule)))
(s/def :trigger/repeated boolean?)
(s/def ::trigger-spec (s/keys :req-un
                              [:trigger/name :trigger/description
                               :trigger/stores :trigger/recipients
                               :trigger/rules :trigger/repeated]))
