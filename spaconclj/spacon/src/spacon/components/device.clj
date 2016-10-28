(ns spacon.components.device
  (:require [com.stuartsierra.component :as component]
            [spacon.http.intercept :as intercept]
            [clojure.data.json :as json]
            [ring.util.response :as ring-resp]
            [spacon.db.conn :as db]
            [yesql.core :refer [defqueries]]))

(defqueries "sql/device.sql"
            {:connection db/db-spec})

(defn entity->map [c]
  {:id (:id c)
   :identifier (:identifier c)
   :device_info (if-let [v (:device_info c)]
                  (json/read-str (.getValue v))
                  nil)})

(defn device-count []
  (count-devices-query))

(defn device-list[]
  (map (fn [d]
         (entity->map d)) (device-list-query)))

(defn find-device [id]
  (if-let [d (find-by-id-query id)]
      (entity->map d)
      nil))

(defn http-get [context]
  (let [d (device-list)]
    (ring-resp/response {:response d})))

(defn http-get-device [context]
  (let [d (find-device {})]))

(defn http-post-device [context]
  (entity->map (insert-device<! (:body-params context))))

(defn http-put-device [context]
  (entity->map (update-device<! (:body-params context))))

(defn http-delete-device [context]
  (delete-device! (get-in [:request-params] context)))

(defn http-create-device [context]
  (let [device (create-device<! context)]
    device))

(defn- routes [] #{["/api/devices" :get
                    (conj intercept/common-interceptors `http-get)]
                   ["/api/devices/:id" :get
                    (conj intercept/common-interceptors `http-get-device)]
                   ["/api/devices/:id" :put
                    (conj intercept/common-interceptors `http-put-device)]
                   ["/api/devices" :post
                    (conj intercept/common-interceptors `http-create-device)]
                   ["/api/devices/:id" :delete
                    (conj intercept/common-interceptors `http-delete-device)]})

(defrecord DeviceComponent []
  component/Lifecycle
  (start [this]
    (print "Starting Device")
    (assoc this :routes (routes)))
  (stop [this]
    (print "Stopping Device")
    this))

(defn make-device-component []
  (map->DeviceComponent {}))