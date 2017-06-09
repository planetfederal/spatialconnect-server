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

(ns spacon.location-test
  (:require [clojure.test :refer :all]
            [spacon.test-utils :as utils]
            [spacon.components.location.core :refer :all]
            [spacon.components.location.db :as locationmodel]
            [spacon.components.mqtt.core :as mqttapi]
            [clojure.data.json :as json]
            [spacon.entity.msg :as msg]
            [spacon.specs.geojson]
            [clojure.spec.gen :as gen]
            [clojure.spec :as spec])
  (:import (com.boundlessgeo.schema Actions)))

(use-fixtures :once utils/setup-fixtures)

(deftest location-update-persisted-test
  (testing "When a location is sent on the /store/tracking topic, it is persisted"
    (let [mqtt (:mqtt user/system-val)
          loc  (gen/generate (spec/gen :spacon.specs.geojson/pointfeature-spec))
          device-id (->> (utils/request-get "/api/devices") :result first :identifier)
          payload (assoc loc :metadata {:client device-id})
          m (msg/map->Msg {:action (.value Actions/NO_ACTION)
                           :payload payload})]
      (mqttapi/publish-scmessage mqtt "/store/tracking" m)
      (Thread/sleep 2000)
      (let [res (utils/request-get "/api/locations")
            features (get-in res [:result :features])
            coords (doall (map #(get-in % [:geometry :coordinates]) features))
            lat (first (get-in loc [:geometry :coordinates]))
            lon (second (get-in loc [:geometry :coordinates]))]
        (is (not (empty? (filter #(and (= lat (first %))
                                       (= lon (second %)))
                                 coords)))
            "The submitted point should be in the response")))))

