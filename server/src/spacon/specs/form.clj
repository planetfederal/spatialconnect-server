;; Copyright 2016-2017 Boundless, http://boundlessgeo.com
;;
;; Licensed under the Apache License, Version 2.0 (the "License");
;; you may not use this file except in compliance with the License.
;; You may obtain a copy of the License at
;;
;; http://www.apache.org/licenses/LICENSE-2.0
;;
;; Unless required by applicable law or agreed to in writing, software
;; distributed under the License is distributed on an "AS IS" BASIS,
;; WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
;; See the License for the specific language governing permissions and
;; limitations under the License.

(ns spacon.specs.form
  (:require [clojure.spec :as s]
            [spacon.components.team.db :as teammodel]
            [clojure.test.check.generators :as gen]
            [com.gfredericks.test.chuck.generators :as genc]))

(def int-str-gen (s/with-gen
                   (s/and string? #(> (count %) 0) (fn [p] (re-matches #"(?:\d*\.)?\d+" p)))
                   #(gen/fmap (fn [s1] (str s1)) gen/int)))

(def int-regex #"\d+")
(def pos-int-str-gen (s/with-gen
                       (s/and string? #(> (count %) 0) (fn [p] (re-matches int-regex p)))
                       #(genc/string-from-regex int-regex)))

(def double-regex #"(?:\d*\.)?\d+")
(def num-str-gen (s/with-gen
                   (s/and string? #(> (count %) 0) (fn [p] (re-matches double-regex p)))
                   #(genc/string-from-regex double-regex)))

(def non-empty-string (s/with-gen
                        (s/and string? #(> (count %) 0))
                        #(gen/fmap identity gen/string-alphanumeric)))

(s/def :fieldoptstring/initial-value non-empty-string)
(s/def :fieldoptnum/initial-value num-str-gen)
(s/def :fieldoptnum/minimum num-str-gen)
(s/def :fieldoptnum/maximum num-str-gen)
(s/def :fieldoptint/initial-value int-str-gen)
(s/def :fieldoptint/maximum int-str-gen)
(s/def :fieldoptint/minimum int-str-gen)
(s/def :fieldopt/is-integer boolean?)
(s/def :fieldopt/minimum-length pos-int-str-gen)
(s/def :fieldopt/maximum-length pos-int-str-gen)
(s/def :fieldopt/pattern string?)
(s/def :fieldopt/options (s/coll-of non-empty-string :kind vector?
                                    :min-count 1 :distinct true))

(def field-types #{"string" "number" "date" "boolean"
                   "select" "slider" "counter" "photo"})
(s/def :fieldstring/type (s/with-gen (s/and string? #(contains? #{"string"} %))
                           #(s/gen #{"string"})))
(s/def :fieldstring/constraints (s/keys :opt-un [:fieldoptstring/initial-value
                                                 :fieldopt/minimum-length
                                                 :fieldopt/maximum-length
                                                 :fieldopt/pattern]))
(s/def :fieldboolean/type (s/with-gen (s/and string? #(contains? #{"boolean"} %))
                            #(s/gen #{"boolean"})))
(s/def :fieldboolean/constraints (s/and map? empty?))

(s/def :fieldcounter/type (s/with-gen (s/and string? #(contains? #{"counter"} %))
                            #(s/gen #{"counter"})))
(s/def :fieldcounter/constraints (s/keys :req-un [:fieldoptint/initial-value
                                                  :fieldoptint/maximum
                                                  :fieldoptint/minimum]))
(s/def :fielddate/type (s/with-gen (s/and string? #(contains? #{"date"} %))
                         #(s/gen #{"date"})))
(s/def :fielddate/constraints (s/and map? empty?))

(s/def :fieldslider/type (s/with-gen (s/and string? #(contains? #{"slider"} %))
                           #(s/gen #{"slider"})))
(s/def :fieldslider/constraints (s/keys :req-un [:fieldoptnum/initial-value
                                                 :fieldoptnum/maximum
                                                 :fieldoptnum/minimum]))

(s/def :fieldselect/type (s/with-gen (s/and string? #(contains? #{"select"} %))
                           #(s/gen #{"select"})))
(s/def :fieldselect/constraints (s/keys :req-un [:fieldopt/options]))

(s/def :fieldphoto/type (s/with-gen (s/and string? #(contains? #{"photo"} %))
                          #(s/gen #{"photo"})))
(s/def :fieldphoto/constraints (s/and map? empty?))

(s/def :fieldnumber/type (s/with-gen (s/and string? #(contains? #{"number"} %))
                           #(s/gen #{"number"})))
(s/def :fieldnumber/constraints (s/keys :opt-un [:fieldoptnum/initial-value
                                                 :fieldoptnum/minimum
                                                 :fieldoptnum/maximum
                                                 :fieldopt/is-integer]))

(s/def :field/type field-types)
(s/def :field/position (s/int-in 0 100))
(s/def :field/is-required boolean?)
(s/def :field/id pos-int?)
(s/def :field/field-label (s/and string? #(> (count %) 0)))
(def sqlcol-regex #"[a-z][a-z0-9_]*")
(s/def :field/field-key (s/with-gen
                          (s/and string? #(> (count %) 0) #(re-matches sqlcol-regex %))
                          #(genc/string-from-regex sqlcol-regex)))

(s/def :fieldstring/spec (s/keys :req-un [:field/id :field/field-key :field/is-required
                                          :field/position :field/field-label :fieldstring/type
                                          :fieldstring/constraints]))
(s/def :fieldnumber/spec (s/keys :req-un [:field/id :field/field-key :field/is-required
                                          :field/position :field/field-label :fieldnumber/type
                                          :fieldnumber/constraints]))
(s/def :fielddate/spec (s/keys :req-un [:field/id :field/field-key :field/is-required
                                        :field/position :field/field-label :fielddate/type]))
(s/def :fieldboolean/spec (s/keys :req-un [:field/id :field/field-key :field/is-required
                                           :field/position :field/field-label :fieldboolean/type]))
(s/def :fieldselect/spec (s/keys :req-un [:field/id :field/field-key :field/is-required
                                          :field/position :field/field-label :fieldselect/type
                                          :fieldselect/constraints]))

(s/def :fieldslider/spec (s/keys :req-un [:field/id :field/field-key :field/is-required
                                          :field/position :field/field-label :fieldslider/type
                                          :fieldslider/constraints]))

(s/def :fieldphoto/spec (s/keys :req-un [:field/id :field/field-key :field/is-required
                                         :field/position :field/field-label :fieldphoto/type]))

(s/def :fieldcounter/spec (s/keys :req-un [:field/id :field/field-key :field/is-required
                                           :field/position :field/field-label :fieldcounter/type
                                           :fieldcounter/constraints]))

(s/def ::field-spec (s/or :number :fieldnumber/spec
                          :string :fieldstring/spec
                          :date :fielddate/spec
                          :boolean :fieldboolean/spec
                          :select :fieldselect/spec
                          :slider :fieldslider/spec
                          :photo :fieldphoto/spec
                          :counter :fieldcounter/spec))

(s/def :form/form-key :field/field-key)
(s/def :form/version pos-int?)
(s/def :form/form-label (s/and string? #(> (count %) 0)))
(s/def :form/fields (s/coll-of ::field-spec))
(s/def :form/team-id (s/with-gen (s/and int? pos?)
                       #(s/gen (set (map :id (teammodel/all))))))

(s/def ::form-spec (s/keys :req-un [:form/form-key :form/version :form/form-label
                                    :form/fields :form/team-id]))