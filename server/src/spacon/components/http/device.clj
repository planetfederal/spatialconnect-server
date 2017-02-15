(ns spacon.components.http.device
  (:require [spacon.components.device.core :as deviceapi]
            [clojure.tools.logging :as log]
            [spacon.components.http.response :as response]
            [clojure.spec :as s]
            [spacon.components.http.intercept :as intercept]))

(defn http-get-all-devices
  "Returns http response of all devices"
  [device-comp _]
  (log/debug "Getting all devices")
  (response/ok (deviceapi/all device-comp)))

(defn http-get-device
  "Gets a device by id"
  [device-comp request]
  (log/debug "Getting device by id")
  (let [id (get-in request [:path-params :id])]
    (if-let [device (deviceapi/find-by-identifier device-comp id)]
      (response/ok device)
      (let [err-msg (str "No device found for id" id)]
        (log/warn err-msg)
        (response/ok err-msg)))))

(defn http-post-device
  "Creates a new device using the json body"
  [device-comp request]
  (log/debug "Adding new device")
  (let [device (:json-params request)]
    (if (s/valid? :spacon.specs.device/device-spec device)
      (if-let [d (deviceapi/create device-comp device)]
        (response/ok d))
      (let [reason  (s/explain-str :spacon.specs.device/device-spec device)
            err-msg (format "Failed to create new device %s because %s" device reason)]
        (log/error err-msg)
        (response/error err-msg)))))

(defn http-put-device
  "Updates a device using the json body"
  [device-comp request]
  (log/debug "Updating device")
  (if-let [d (deviceapi/modify device-comp
                               (get-in request [:path-params :id])
                               (:json-params request))]
    (response/ok d)
    (let [err-msg "Failed to update device"]
      (log/error err-msg)
      (response/error err-msg))))

(defn http-delete-device
  "Deletes a device"
  [device-comp request]
  (log/debug "Deleting device")
  (deviceapi/delete device-comp (get-in request [:path-params :id]))
  (response/ok "success"))

(defn routes [device-comp] #{["/api/devices" :get
                              (conj intercept/common-interceptors (partial http-get-all-devices device-comp)) :route-name :get-devices]
                             ["/api/devices/:id" :get
                              (conj intercept/common-interceptors (partial http-get-device device-comp)) :route-name :get-device]
                             ["/api/devices/:id" :put
                              (conj intercept/common-interceptors (partial http-put-device device-comp)) :route-name :put-device]
                             ["/api/devices" :post
                              (conj intercept/common-interceptors (partial http-post-device device-comp)) :route-name :post-device]
                             ["/api/devices/:id" :delete
                              (conj intercept/common-interceptors (partial http-delete-device device-comp)) :route-name :delete-device]})
