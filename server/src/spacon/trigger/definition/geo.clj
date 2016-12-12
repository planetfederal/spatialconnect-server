(ns spacon.trigger.definition.geo
  (:require [spacon.trigger.protocol :as proto]
            [cljts.io :as jtsio]
            [clojure.data.json :as json]))

(defn rhs->jtsgeom [c]
  (jtsio/read-feature-collection
   (json/write-str c)))

(defn check-simple-feature [A B]
  (cljts.relation/within? A B))

(defn check-feature-collection [A B]
  (if-let [features (.features B)]
    (if (.hasNext features)
      (loop [feature (-> features .next .getDefaultGeometry)]
        (if (check-simple-feature A feature)
          true
          (if (.hasNext features)
            (recur (-> features .next .getDefaultGeometry))
            false))); fails within, false
      false) ; has no .next, false
    false)); has no features, false

(def clause-case-map {org.geotools.feature.DefaultFeatureCollection check-feature-collection,
                      org.geotools.feature.simple.SimpleFeatureImpl check-simple-feature})

(defrecord WithinClause [trigger-id clause]
  proto/IClause
  (field-path [this] (:clause this))
  (predicate [this] :$geowithin)
  (check [this value]
    (if-let [f (clause-case-map (type (:clause this)))]
      (apply f [value (:clause this)])
      false))
  (notification [this v]
    (str "Within was triggered")))

(defn make-within-clause [id clause]
  (->WithinClause id (rhs->jtsgeom clause)))

