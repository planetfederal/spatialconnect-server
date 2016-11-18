(ns spacon.models.locations
  (:require [spacon.db.conn :as db]
            [yesql.core :refer [defqueries]]
            [clojure.spec :as s]
            [clojure.data.json :as json]
            [cljts.io :as jio]
            [cljts.geom :as jeom]))

(defqueries "sql/location.sql"
            {:connection db/db-spec})

(defn entity->map [c]
  (assoc c :device_info (if-let [v (:device_info c)]
                          (json/read-str (.getValue v))
                          nil)
           :geometry (jio/read-wkt-str (:geom c))
           :updated_at (.toString (:updated_at c))))

(defn locations []
  (map (fn [d]
         (entity->map d)) (device-locations)))

(defn upsert-location [p client]
  (upsert-location! {:geom (jio/write-wkt-str p) :device_id client}))

(defn upsert-location-gj [loc]
  (let [x (get-in loc [:geometry :coordinates 0])
        y (get-in loc [:geometry :coordinates 1])
        z (get-in loc [:geometry :coordinates 2])
        p (jeom/point (jeom/c x y z))
        did (get-in loc [:metadata :client])]
    (upsert-location p did)))

;;; specs about device data
(s/def ::x double?)
(s/def ::y double?)
(s/def ::z double?)
(s/def ::device-id integer?)
(s/def ::location-spec (s/keys :req-un [::x ::y ::z ::device-id]))

(defn sanitize [location]
  (dissoc location :created_at :updated_at :deleted_at))