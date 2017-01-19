(ns spacon.specs.team
  (:require [clojure.spec :as s]
            [spacon.components.organization.db :as orgsmodel]
            [clojure.test.check.generators :as gen]))

(s/def :team/name non-empty-string)
(s/def :team/organization-id
  (s/with-gen pos-int?
    #(s/gen (set (map :id (orgsmodel/all))))))
(s/def ::team-spec (s/keys :req-un
                           [:team/name :team/organization-id]))