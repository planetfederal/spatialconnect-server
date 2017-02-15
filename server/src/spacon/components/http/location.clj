(ns spacon.components.http.location
  (:require [spacon.components.http.intercept :as intercept]
            [spacon.components.http.response :as response]
            [spacon.components.location.core :as locationapi]
            [clojure.tools.logging :as log]))

(defn http-get-all-locations
  "Returns the latest location of each device"
  [location-comp _]
  (log/debug "Getting all device locations")
  (let [fs (locationapi/locations location-comp)]
    (response/ok {:type     "FeatureCollection"
                  :features fs})))

(defn routes [location-comp]
  #{["/api/locations" :get
     (conj intercept/common-interceptors (partial http-get-all-locations location-comp))
     :route-name :get-locations]})
