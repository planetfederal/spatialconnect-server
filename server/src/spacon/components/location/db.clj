(ns spacon.components.location.db
  (:require [spacon.db.conn :as db]
            [yesql.core :refer [defqueries]]
            [clojure.spec :as s]
            [clojure.data.json :as json]
            [cljts.io :as jio]
            [cljts.geom :as jeom]))

(defqueries "sql/location.sql"
  {:connection db/db-spec})

(defn- sanitize
  [location]
  (dissoc location :created_at :updated_at :deleted_at))

(defn- entity->map [c]
  (assoc c :device_info (:device_info c)
         :geometry (jio/read-wkt-str (:geom c))
         :updated_at (.toString (:updated_at c))))

(defn all
  "Gets all the device locations"
  []
  (map (fn [d]
         (entity->map d)) (device-locations)))

(defn upsert
  "Upserts a JTS point geometry and a client identifier"
  [p client]
  (upsert-location! {:geom (jio/write-wkt-str p) :identifier client}))

(defn upsert-gj
  "Upserts a geojson structured map"
  [loc]
  (let [x (get-in loc [:geometry :coordinates 0])
        y (get-in loc [:geometry :coordinates 1])
        z (get-in loc [:geometry :coordinates 2])
        p (jeom/point (jeom/c x y z))
        did (get-in loc [:metadata :client])]
    (upsert p did)))
