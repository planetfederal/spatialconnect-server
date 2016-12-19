(ns spacon.specs.form
  (:require [clojure.spec :as s]))

;;; specs for forms
(s/def ::form_key string?)
(s/def ::form_label string?)
(s/def ::version pos-int?)
(s/def ::team-id pos-int?)
(s/def ::form-spec (s/keys :req-un [::form_key ::version ::team-id]
                           :opt-un [::form_label]))
;;; spec for form-data
(s/def :formdata/device-id pos-int?)
(s/def :formdata/form-id pos-int?)
(s/def ::form-data-spec (s/keys :req-un
                                [:formdata/device-id :formdata/form-id]))
