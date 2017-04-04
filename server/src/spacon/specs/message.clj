(ns spacon.specs.message
  (:require [clojure.spec :as s]))

(s/def ::payload map?)
(s/def ::command string?)
(s/def ::connect-message (s/keys :req-un [::payload ::command]))
