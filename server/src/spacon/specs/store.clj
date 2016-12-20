(ns spacon.specs.store
  (:require [clojure.spec :as s]
            [clojure.test.check.generators :as gen]
            [spacon.components.team.db :as teammodel]))

(defn uuid-string-gen []
  (->>
   (gen/uuid)
   (gen/fmap #(.toString %))))

;; define specs about store
(def uuid-regex #"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")
(s/def :store/id (s/with-gen
                   (s/and string? #(re-matches uuid-regex %))
                   #(uuid-string-gen)))
(s/def :store/store-type string?)
(s/def :store/version string?)
(s/def :store/uri string?)
(s/def :store/name string?)
(s/def :store/team-id (s/with-gen (s/and int? pos?)
                        #(s/gen (set (map :id (teammodel/all))))))
(s/def :store/default-layers (s/coll-of string?))
(s/def ::store-spec (s/keys :req-un [:store/name :store/store-type
                                     :store/team-id :store/version :store/uri
                                     :store/default-layers]))
