(ns spacon.specs.team
  (:require [clojure.spec :as s]
            [spacon.specs.util :as util]
            [spacon.components.organization.db :as orgsmodel]))

(s/def :team/name util/non-empty-string)
(s/def :team/organization-id
  (s/with-gen pos-int?
    #(s/gen (set (map :id (orgsmodel/all))))))
(s/def ::team-spec (s/keys :req-un
                           [:team/name :team/organization-id]))