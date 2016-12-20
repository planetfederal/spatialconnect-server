(ns spacon.components.device.db
  (:require [spacon.db.conn :as db]
            [clojure.data.json :as json]
            [yesql.core :refer [defqueries]]
            [spacon.specs.device :as device-spec]
            [clojure.spec :as s]))

(defqueries "sql/device.sql"
  {:connection db/db-spec})

(defn- entity->map
  "maps an entity returned from the database to a clojure map"
  [entity]
  (if (nil? entity)
    {}
    {:id          (:id entity)
     :identifier  (:identifier entity)
     :name        (:name entity)
     :device-info (:device_info entity)}))

(defn- sanitize [device]
  (dissoc device :created_at :updated_at :deleted_at))

(defn count-devices
  "Count of all the active devices"
  []
  (count-devices-query))

(defn all
  "Retrieves all the active devices deleted_at = null"
  []
  (map (fn [d]
         (entity->map d)) (device-list-query)))

(defn find-by-identifier
  "Finds device by its unique identifier"
  [identifier]
  (some-> (find-by-identifier-query {:identifier identifier})
          (last)
          entity->map))

(defn create
  "Takes a map representing a device and saves it to the database if it's valid.
   returns the device with the id or nil"
  [d]
  (if-not (s/valid? :spacon.specs.device/device-spec d)
    (s/explain-str :spacon.specs.device/device-spec d)
    (entity->map
     (create-device<! {:identifier  (:identifier d)
                       :name        (:name d)
                       :device_info (json/write-str (:device-info d))}))))

(defn modify
  "Updates the device info by the unique id"
  [identifier d]
  (let [di (:device-info d)]
    (entity->map
     (update-device<! {:identifier identifier
                       :device_info (if (nil? di)
                                      nil
                                      (json/write-str di))}))))

(defn delete
  "Deactivates the device"
  [identifier]
  (delete-device! {:identifier identifier}))

(s/fdef find-by-identifier
        :args (s/cat :identifier string?))

(s/fdef create
        :args (s/cat :device (s/spec :spacon.specs.device/device-spec)))

(s/fdef update
        :args (s/cat :id string?
                     :device (s/spec :spacon.specs.device/device-spec)))

(s/fdef delete
        :args (s/cat :identifier string?))
