;; Copyright 2017 Boundless, http://boundlessgeo.com
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

(ns spacon.components.http.layer
  (:require [spacon.components.http.response :as response]
            [clojure.tools.logging :as log]
            [spacon.components.http.intercept :refer [common-interceptors]]
            [spacon.components.http.auth :refer [check-auth]]
            [spacon.components.layer.core :as layerapi]
            [clojure.spec :as s]))

(defn http-post-layer
  "Handles request to create a new layer"
  [api request]
  (let [config (:json-params request)]
    (if (s/valid? ::layerapi/config config)
      (let [new-layer (layerapi/create-layer api config)]
        (response/ok new-layer))
      (let [reason (s/explain-str ::layerapi/config config)
            err-msg (format "Failed to create new layer because %s" reason)]
        (log/error err-msg)
        (response/bad-request err-msg)))))

(defn http-get-layers
  "Handles a request for layers"
  [api request]
  (let [offset (get-in request [:query-params :offset])
        limit  (get-in request [:query-params :limit])
        layers (layerapi/list-layers api (or offset 0) (or limit 10))]
    (response/ok layers)))

(defn http-get-layer-by-id
  "Handles a request for single layer"
  [api request]
  (let [id (get-in request [:path-params :id])
        layer (layerapi/get-layer-by-id api (Integer/parseInt id))]
    (response/ok layer)))

(defn routes [layer-component]
  #{["/api/layers" :get
     (conj common-interceptors check-auth (partial http-get-layers layer-component))
     :route-name :get-layers]
    ["/api/layers/:id" :get
     (conj common-interceptors check-auth (partial http-get-layer-by-id layer-component))
     :route-name :get-layer-by-id]
    ["/api/layers" :post
     (conj common-interceptors check-auth (partial http-post-layer layer-component))
     :route-name :post-layer]})
