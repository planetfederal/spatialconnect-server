(ns spacon.util.geo
  (:refer-clojure :exclude [type]))

(defn make-geojsonmap [{:keys type coordinates} geometry]
  {:type type
   :coordinates coordinates})

(defn make-geojson-featuremap [{:keys id properties geometry} feature]
  {:type :Feature
   :id id
   :properties properties
   :geometry (make-geojsonmap geometry)})

(defn make-geojson-featurecollectionmap [features]
  {:type :FeatureCollection
   :features (map make-geojson-featuremap features)})

(make-geojsonmap {:id "foo" :geometry {:type :Point :coordinates (list 1 2)}})
