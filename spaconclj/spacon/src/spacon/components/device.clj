(ns spacon.components.device
  (:require [com.stuartsierra.component :as component]
            [spacon.http.intercept :as intercept]
            [clojure.data.json :as json]
            [ring.util.response :as ring-resp]
            [spacon.db.conn :as db]
            [yesql.core :refer [defqueries]]
            [clojure.spec :as s]))

;;; specs about device data
(s/def ::name string?)
(s/def ::identifier string?)
(s/def ::device-info map?)
(s/def ::device-spec (s/keys :req-un [::name ::identifier ::device-info]))

(defqueries "sql/device.sql" {:connection db/db-spec})

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

(defn http-get [context]
  (let [d (device-list)]
    (ring-resp/response {:response d})))

(defn http-get-device [context]
  (if-let [id (get-in context [:path-params :id])]
    (ring-resp/response {:response (find-device id)})
    (ring-resp/response {:response nil})))

(defn http-post-device [context]
  (if-let [d (create-device (:json-params context))]
    (ring-resp/response {:response d})
    (ring-resp/response {:response "Error creating"})))

(defn http-put-device [context]
  (if-let [d (update-device
               (get-in context [:path-params :id])
               (:json-params context))]
    (ring-resp/response {:response d})
    (ring-resp/response {:response "Error updating"})))

(defn http-delete-device [context]
  (delete-device (get-in context [:path-params :id]))
  (ring-resp/response {:response "success"}))

(defn- routes [] #{["/api/devices" :get
                    (conj intercept/common-interceptors `http-get)]
                   ["/api/devices/:id" :get
                    (conj intercept/common-interceptors `http-get-device)]
                   ["/api/devices/:id" :put
                    (conj intercept/common-interceptors `http-put-device)]
                   ["/api/devices" :post
                    (conj intercept/common-interceptors `http-post-device)]
                   ["/api/devices/:id" :delete
                    (conj intercept/common-interceptors `http-delete-device)]})

(defrecord DeviceComponent []
  component/Lifecycle
  (start [this]
    (assoc this :routes (routes)))
  (stop [this]
    this))

(defn make-device-component []
  (->DeviceComponent))

(s/fdef create-device
  :args (s/cat :device (s/spec ::device-spec)))

(s/fdef update-device
  :args (s/cat :id string?
               :device (s/spec ::device-spec)))
