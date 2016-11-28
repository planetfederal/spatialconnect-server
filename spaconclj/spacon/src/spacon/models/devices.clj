(ns spacon.models.devices
  (:require [spacon.db.conn :as db]
            [clojure.data.json :as json]
            [yesql.core :refer [defqueries]]
            [clojure.spec :as s]))

(defqueries "sql/device.sql"
            {:connection db/db-spec})

;;; specs about device data
(s/def ::name string?)
(s/def ::identifier string?)
(s/def ::device-info map?)
(s/def ::device-spec (s/keys :req-un [::name ::identifier ::device-info]))

(defn entity->map
  "maps an entity returned from the database to a clojure map"
  [entity]
  (if (nil? entity)
    {}
    {:id          (:id entity)
     :identifier  (:identifier entity)
     :name        (:name entity)
     :device-info (json/read-str (.getValue (:device_info entity)))}))

(defn device-count []
  (count-devices-query))

(defn device-list[]
  (map (fn [d]
         (entity->map d)) (device-list-query)))

(defn find-device [ident]
  (some-> (find-by-identifier-query {:identifier ident})
          (last)
          entity->map))

(defn create-device
  "takes a map representing a device and saves it to the database if it's valid.
   returns the device with the id or nil"
  [d]
  (println (json/write-str d))
  (if-not (s/valid? ::device-spec d)
    (s/explain-str ::device-spec d)
    (entity->map
      (insert-device<! {:identifier  (:identifier d)
                        :name        (:name d)
                        :device_info (json/write-str (:device-info d))}))))

(defn update-device [identifier d]
  (let [di (:device-info d)]
    (entity->map
      (update-device<! {:identifier identifier
                        :device_info (if (nil? di)
                                       nil
                                       (json/write-str di))}))))

(defn delete-device [identifier]
  (delete-device! {:identifier identifier}))


(defn sanitize [device]
  (dissoc device :created_at :updated_at :deleted_at))


(s/fdef create-device
        :args (s/cat :device (s/spec ::device-spec)))

(s/fdef update-device
        :args (s/cat :id string?
                     :device (s/spec ::device-spec)))
