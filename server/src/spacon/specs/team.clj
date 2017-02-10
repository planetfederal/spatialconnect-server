(ns spacon.specs.team
  (:require [clojure.spec :as s]
            [spacon.components.organization.db :as orgsmodel]
            [clojure.test.check.generators :as gen]))

(def non-empty-string (s/with-gen
                        (s/and string? #(> (count %) 0))
                        #(gen/fmap identity gen/string-alphanumeric)))
;;; specs for teams
(s/def :team/name non-empty-string)
(s/def :team/organization-id
  (s/with-gen pos-int?
    #(s/gen (set (map :id (orgsmodel/all))))))
(s/def ::team-spec (s/keys :req-un
                           [:team/name :team/organization-id]))