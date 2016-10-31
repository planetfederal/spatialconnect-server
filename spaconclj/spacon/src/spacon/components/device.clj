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

(defn find-device [ident]
    (some-> (find-by-identifier-query {:identifier ident})
            (last)
            entity->map))

(defn create-device [d]
  (let [di (:device_info d)]
    (entity->map
      (insert-device<! {:identifier (:identifier d)
                        :device_info (if (nil? di)
                                       nil
                                       (json/write-str di))}))))

(defn update-device [identifier d]
  (let [di (:device_info d)]
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