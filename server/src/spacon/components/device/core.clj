;; Copyright 2016-2017 Boundless, http://boundlessgeo.com
;;
;; Licensed under the Apache License, Version 2.0 (the "License");
;; you may not use this file except in compliance with the License.
;; You may obtain a copy of the License at
;;
;; http://www.apache.org/licenses/LICENSE-2.0
;;
;; Unless required by applicable law or agreed to in writing, software
;; distributed under the License is distributed on an "AS IS" BASIS,
;; WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
;; See the License for the specific language governing permissions and
;; limitations under the License.

(ns spacon.components.device.core
  (:require [com.stuartsierra.component :as component]
            [spacon.http.intercept :as intercept]
            [yesql.core :refer [defqueries]]
            [spacon.components.device.db :as devicemodel]
            [spacon.http.response :as response]
            [clojure.spec :as s]
            [clojure.tools.logging :as log]))

(defn http-get-all-devices
  "Returns http response of all devices"
  [_]
  (log/debug "Getting all devices")
  (response/ok (devicemodel/all)))

(defn http-get-device
  "Gets a device by id"
  [request]
  (log/debug "Getting device by id")
  (let [id (get-in request [:path-params :id])]
    (if-let [device (devicemodel/find-by-identifier id)]
      (response/ok device)
      (let [err-msg (str "No device found for id" id)]
        (log/warn err-msg)
        (response/ok err-msg)))))

(defn http-post-device
  "Creates a new device using the json body"
  [request]
  (log/debug "Adding new device")
  (let [device (:json-params request)]
    (if (s/valid? :spacon.specs.device/device-spec device)
      (if-let [d (devicemodel/create device)]
        (response/ok d))
      (let [reason  (s/explain-str :spacon.specs.device/device-spec device)
            err-msg (format "Failed to create new device %s because %s" device reason)]
        (log/error err-msg)
        (response/error err-msg)))))

(defn http-put-device
  "Updates a device using the json body"
  [request]
  (log/debug "Updating device")
  (if-let [d (devicemodel/modify
              (get-in request [:path-params :id])
              (:json-params request))]
    (response/ok d)
    (let [err-msg "Failed to update device"]
      (log/error err-msg)
      (response/error err-msg))))

(defn http-delete-device
  "Deletes a device"
  [request]
  (log/debug "Deleting device")
  (devicemodel/delete (get-in request [:path-params :id]))
  (response/ok "success"))

(defn- routes [] #{["/api/devices" :get
                    (conj intercept/common-interceptors `http-get-all-devices)]
                   ["/api/devices/:id" :get
                    (conj intercept/common-interceptors `http-get-device)]
                   ["/api/devices/:id" :put
                    (conj intercept/common-interceptors `http-put-device)]
                   ["/api/devices" :post
                    (conj intercept/common-interceptors `http-post-device)]
                   ["/api/devices/:id" :delete
                    (conj intercept/common-interceptors `http-delete-device)]})

(defrecord DeviceComponent [mqtt]
  component/Lifecycle
  (start [this]
    (log/debug "Starting Device Component")
    (assoc this :routes (routes)))
  (stop [this]
    (log/debug "Stopping Device Component")
    this))

(defn make-device-component []
  (map->DeviceComponent {}))
