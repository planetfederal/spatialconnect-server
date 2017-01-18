(ns spacon.specs.util
  (:require [clojure.spec.gen :as gen]
            [clojure.spec :as s]
            [com.gfredericks.test.chuck.generators :as genc]))


(def int-str-gen (s/with-gen
                   (s/and string? #(> (count %) 0) (fn [p] (re-matches #"(?:\d*\.)?\d+" p)))
                   #(gen/fmap (fn [s1] (str s1)) gen/int)))

(def pos-int-str-gen (s/with-gen
                       (s/and string? #(> (count %) 0) (fn [p] (re-matches int-regex p)))
                       #(genc/string-from-regex int-regex)))

(def num-str-gen (s/with-gen
                   (s/and string? #(> (count %) 0) (fn [p] (re-matches double-regex p)))
                   #(genc/string-from-regex double-regex)))

(def non-empty-string (s/with-gen
                        (s/and string? #(> (count %) 0))
                        #(gen/fmap identity gen/string-alphanumeric)))

