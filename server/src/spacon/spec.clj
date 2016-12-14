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

;;; specs for organization
(s/def :organization/name string?)
(s/def ::organization-spec (s/keys :req-un [:organization/name]))

;;; specs for forms
(s/def :form/form_key string?)
(s/def :form/form_label string?)
(s/def :form/version pos-int?)
(s/def :form/team-id pos-int?)
(s/def ::form-spec (s/keys :req-un [:form/form_key :form/version :form/team-id]
                           :opt-un [:form/form_label]))
;;; spec for form-data
(s/def :formdata/device-id pos-int?)
(s/def :formdata/form-id pos-int?)
(s/def ::form-data-spec (s/keys :req-un
                                [:formdata/device-id :formdata/form-id]))

(defn circle-gen [x y]
  (let [vertices (+ (rand-int 8) 4)
        radius (rand 3) ;2 dec degrees radius length
        rads (/ (* 2.0 Math/PI) vertices)
        pts (map (fn [r]
                   [(+ x (* radius (Math/cos (* r rads))))
                    (+ y (* radius (Math/sin (* rads r))))])
                 (range vertices))]
    (conj pts (last pts))))

;;; geojson
(s/def :gj/x (s/double-in :min -175.0 :max 175.0 :NaN? false :infinite? false))
(s/def :gj/y (s/double-in :min -85.0 :max 85.0 :NaN? false :infinite? false))
(def xypair (gen/tuple (s/gen :gj/x) (s/gen :gj/y)))
(s/def :gj/coordinates (s/with-gen
                         coll?
                         #(gen/fmap (fn [[lon lat]] (list lon lat))
                                    (gen/tuple (s/gen :gj/x) (s/gen :gj/y)))))
(s/def :gjpt/type (s/with-gen string? #(s/gen #{"Point"})))
(s/def :gjls/coordinates (s/coll-of :gj/coordinates :min-count 3))
(s/def :gjls/type (s/with-gen string? #(s/gen #{"LineString"})))
(s/def :gjpl/coordinates (s/with-gen
                           coll?
                           #(gen/fmap (fn [[lon lat]] (list (circle-gen lon lat)))
                                      (gen/tuple (s/gen :gj/x) (s/gen :gj/y)))))
(s/def :gjpl/type (s/with-gen string? #(s/gen #{"Polygon"})))
(s/def :gjmpt/coordinates (s/coll-of :gj/coordinates))
(s/def :gjmpt/type (s/with-gen string? #(s/gen #{"MultiPoint"})))
(s/def :gjmls/coordinates (s/coll-of :gjls/coordinates))
(s/def :gjmls/type (s/with-gen string? #(s/gen #{"MultiLineString"})))
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
(s/def :gjpt/geometry :gj/point)
(s/def :gjpl/geometry :gj/polygon)
(s/def :gjls/geometry :gj/linestring)
(s/def :gj/geometry :gj/geometrytypes)
(s/def :gfeature/id (s/and string? #(> (count %) 0)))
(s/def :gfeature/properties (s/with-gen
                              (s/or :nil nil? :map map?)
                              #(s/gen #{{}})))
(s/def :gfeature/type (s/with-gen
                        (s/and string? #(contains? #{"Feature"} %))
                        #(s/gen #{"Feature"})))
; Single geojson point feature
(s/def ::pointfeature-spec (s/keys :req-un
                                   [:gfeature/id :gfeature/type
                                    :gfeature/properties :gjpt/geometry]))
; Single geojson polygon feature
(s/def ::polygonfeature-spec (s/keys :req-un
                                     [:gfeature/id :gfeature/type
                                      :gfeature/properties :gjpl/geometry]))
; Single geojson linestring feature
(s/def ::linestringfeature-spec (s/keys :req-un
                                        [:gfeature/id :gfeature/type
                                         :gfeature/properties :gjls/geometry]))
; Single geojson feature
(s/def ::feature-spec (s/keys :req-un
                              [:gfeature/id :gfeature/type
                               :gj/geometry :gfeature/properties])) ;;;TODO Add properties
(s/def :gj/features (s/coll-of ::feature-spec))
(s/def :gjpoly/features (s/coll-of ::polygonfeature-spec :min-count 1))
(s/def :fcgj/type (s/with-gen
                    (s/and string? #(contains? #{"FeatureCollection"} %))
                    #(s/gen #{"FeatureCollection"})))
(s/def ::featurecollection-spec (s/keys :req-un [:fcgj/type :gj/features]))
(s/def ::featurecollectionpolygon-spec (s/keys :req-un
                                               [:fcgj/type :gjpoly/features]))
(s/def :trigger/comparator-spec (s/with-gen
                                  (s/and string? #(contains? #{"$geowithin"} %))
                                  #(s/gen #{"$geowithin"})))

;;; spec for trigger
(s/def :trigger/name string?)
(s/def :trigger/description string?)
(s/def :trigger/stores (s/coll-of (s/or :empty empty? :some string?)))
(s/def :trigger/emails (s/coll-of (s/or :empty empty? :some string?)))
(s/def :trigger/devices (s/coll-of (s/or :empty empty? :some string?)))
(s/def :trigger/recipients (s/keys :req-un [:trigger/emails :trigger/devices]))
(s/def :trigger/lhs (s/coll-of string?))
(s/def :trigger/comparator :trigger/comparator-spec)
(s/def :trigger/rhs ::featurecollectionpolygon-spec)
(s/def :trigger/rule (s/keys :req-un [:trigger/lhs :trigger/comparator :trigger/rhs]))
(s/def :trigger/rules (s/coll-of (s/or :no-rules empty? :some-rules :trigger/rule)))
(s/def :trigger/repeated boolean?)
(s/def ::trigger-spec (s/keys :req-un
                              [:trigger/name :trigger/description
                               :trigger/stores :trigger/recipients
                               :trigger/rules :trigger/repeated]))

(defn uuid-string-gen []
  (->>
   (gen/uuid)
   (gen/fmap #(.toString %))))

;; define specs about store
(def uuid-regex #"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")
(s/def :store/id (s/with-gen
                   (s/and string? #(re-matches uuid-regex %))
                   #(uuid-string-gen)))
(s/def :store/store_type string?)
(s/def :store/version string?)
(s/def :store/uri string?)
(s/def :store/name string?)
(s/def :store/team-id (s/with-gen (s/and int? pos?)
                        #(gen/fmap  (fn [] 1))))
(s/def :store/default_layers (s/coll-of string?))
(s/def ::store-spec (s/keys :req-un [:store/name :store/store_type
                                     :store/team-id :store/version :store/uri
                                     :store/default_layers]))
