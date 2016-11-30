(ns spacon.spec
  (:require [clojure.spec :as s]
            [clojure.spec.test :as t]
            [clojure.spec.gen :as gen]))

;;; specs about device data
(s/def :device/name string?)
(s/def :device/identifier string?)
(s/def :device/info map?)
(s/def ::device-spec (s/keys :req-un [:device/name :device/identifier :device/info]))

;;; specs about user account data
(def email-regex #"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$")
(s/def :user/email-type (s/and string? #(re-matches email-regex %)))
(s/def :user/email :user/email-type)
(s/def :user/password string?)
(s/def :user/name string?)
(s/def ::user-spec (s/keys :req-un [:user/email :user/password]
                           :opt-un [:user/name]))

;;; specs for forms
(s/def :form/form_key string?)
(s/def :form/form_label string?)
(s/def :form/version pos-int?)
(s/def :form/team_id pos-int?)
(s/def ::form-spec (s/keys :req-un [:form/form_key :form/version :form/team_id]
                           :opt-un [:form/form_label]))
;;; spec for form-data
(s/def :formdata/device_id pos-int?)
(s/def :formdata/form_id pos-int?)
(s/def ::form-data-spec (s/keys :req-un
                                [:formdata/device_id :formdata/form_id]))

;;; geojson
(s/def :gj/coordinates (s/coll-of number? :count 3))
(s/def :gjpt/type (s/with-gen string? #(s/gen #{"Point"})))
(s/def :gjls/coordinates (s/coll-of :gj/coordinates))
(s/def :gjls/type (s/with-gen string? #(s/gen #{"Linestring"})))
(s/def :gjpl/coordinates (s/coll-of :gjls/coordinates))
(s/def :gjpl/type (s/with-gen string? #(s/gen #{"Polygon"})))
(s/def :gjmpt/coordinates (s/coll-of :gj/coordinates))
(s/def :gjmpt/type (s/with-gen string? #(s/gen #{"MultiPoint"})))
(s/def :gjmls/coordinates (s/coll-of :gjls/coordinates))
(s/def :gjmls/type (s/with-gen string? #(s/gen #{"MultiLinestring"})))
(s/def :gjmpl/coordinates (s/coll-of :gjpl/coordinates))
(s/def :gjmpl/type (s/with-gen string? #(s/gen #{"MultiPolygon"})))

(def geom-types #{"Point" "Polygon" "LineString"
                  "MultiPolygon" "MultiLinestring" "MultiPoint"})
(s/def :gj/point (s/keys :req-un [:gjpt/type :gj/coordinates]))
(s/def :gj/linestring (s/keys :req-un [:gjls/type :gjls/coordinates]))
(s/def :gj/polygon (s/keys :req-un [:gjpl/type :gjpl/coordinates]))
(s/def :gj/multipoint (s/keys :req [:gjmpt/type :gjmpt/coordinates]))
(s/def :gj/multilinestring (s/keys :req [:gjmls/type :gjmls/coordinates]))
(s/def :gj/multipolygon (s/keys :req [:gjmpl/type :gjmpl/coordinates]))

(s/def :gj/type (s/with-gen
                  (s/and string? #(contains? geom-types %))
                  #(s/gen geom-types)))
(s/def :gj/geometrytypes (s/or :point :gj/point
                               :linestring :gj/linestring
                               :polygon :gj/polygon
                               :multipoint :gj/multipoint
                               :multilinestring :gj/multilinestring
                               :multipolygon :gj/multipolygon))

(s/def :gj/geometry :gj/geometrytypes)
(s/def :gfeature/id string?)
(s/def :gfeature/properties map?)
(s/def :gfeature/type (s/with-gen
                        (s/and string? #(contains? #{"Feature"} %))
                        #(s/gen #{"Feature"})))
(s/def ::feature-spec (s/keys :req-un
                              [:gfeature/id :gfeature/type
                               :gj/geometry :gfeature/properties])) ;;;TODO Add properties
(s/def :gj/features (s/coll-of ::feature-spec))
(s/def :fcgj/type (s/with-gen
                    (s/and string? #(contains? #{"FeatureCollection"} %))
                    #(s/gen #{"FeatureCollection"})))
(s/def ::featurecollection-spec (s/keys :req-un [:fcgj/type :gj/features]))

(gen/sample (s/gen ::featurecollection-spec))
;;; spec for trigger
(s/def :trigger/name string?)
(s/def :trigger/description string?)
(s/def :trigger/stores (s/coll-of string?))
(s/def :trigger/recipients (s/coll-of string?))
(s/def :trigger/lhs (s/coll-of string?))
(s/def :trigger/comparator string?)
(s/def :trigger/rhs ::featurecollection-spec)
(s/def :trigger/rule (s/keys :req-un [:trigger/lhs :trigger/comparator :trigger/rhs]))
(s/def :trigger/rules (s/coll-of :trigger/rule))
(s/def :trigger/repeated boolean?)
(s/def ::trigger-spec (s/keys :req-un
                              [:trigger/name :trigger/description
                               :trigger/stores :trigger/recipients
                               :trigger/rules :trigger/repeated]))
