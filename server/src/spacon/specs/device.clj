(ns spacon.specs.device
  (:require [clojure.spec :as s]
            [clojure.test.check.generators :as gen]))

(def non-empty-string (s/with-gen
                        (s/and string? #(> (count %) 0))
                        #(gen/fmap identity gen/string-alphanumeric)))

;;; specs about device data
(s/def ::name non-empty-string)
(s/def ::identifier non-empty-string)
(s/def ::device-info (s/with-gen map?
                       #(gen/fmap (fn [[t1 t2]]
                                    {t1 t2}) (gen/tuple gen/keyword gen/string-alphanumeric))))
(s/def ::device-spec (s/keys :req-un [::name ::identifier ::device-info]))
