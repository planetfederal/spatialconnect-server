(ns spacon.specs.device
  (:require [clojure.spec :as s]))

;;; specs about device data
(s/def ::name string?)
(s/def ::identifier string?)
(s/def ::info map?)
(s/def ::device-spec (s/keys :req-un [::name ::identifier ::info]))
