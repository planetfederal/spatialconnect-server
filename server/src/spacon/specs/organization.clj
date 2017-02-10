(ns spacon.specs.organization
  (:require [clojure.spec :as s]))

;;; specs for organization
(s/def :organization/name string?)
(s/def ::organization-spec (s/keys :req-un [:organization/name]))

