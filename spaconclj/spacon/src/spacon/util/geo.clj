(ns spacon.util.geo
  (:require [cljts.io :as jtsio]
            [clojure.data.json :as json]))

(defn geojsonmap->filtermap [f]
  (update-in f [:geometry] (fn [g] (jtsio/read-geojson
                                     (json/write-str g)))))