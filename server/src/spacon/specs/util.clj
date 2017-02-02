(ns spacon.specs.util
  (:require [clojure.spec :as s]
            [com.gfredericks.test.chuck.generators :as genc]
            [clojure.test.check.generators :as gen]
            [spacon.util.regex :as regex]))


(def int-str-gen (s/with-gen
                   (s/and string? #(> (count %) 0) (fn [p] (re-matches #"(?:\d*\.)?\d+" p)))
                   #(gen/fmap (fn [s1] (str s1)) gen/int)))

(def pos-int-str-gen (s/with-gen
                       (s/and string? #(> (count %) 0) (fn [p] (re-matches regex/int p)))
                       #(genc/string-from-regex regex/int)))

(def num-str-gen (s/with-gen
                   (s/and string? #(> (count %) 0) (fn [p] (re-matches regex/double p)))
                   #(genc/string-from-regex regex/double)))

(def non-empty-string (s/with-gen
                        (s/and string? #(> (count %) 0))
                        #(gen/fmap identity gen/string-alphanumeric)))

(def non-empty-keyword (s/with-gen
                         (s/and keyword? #(> (count (str %)) 0))
                         #(gen/fmap keyword gen/string-alphanumeric)))

