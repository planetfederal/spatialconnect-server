(ns spacon.location-test
  (:require [clojure.test :refer :all]
            [spacon.test-utils :as utils]
            [spacon.components.location.core :refer :all]
            [spacon.components.location.db :as locationmodel]
            [spacon.components.mqtt.core :as mqttapi]
            [clojure.data.json :as json]
            [spacon.entity.scmessage :as scm]
            [spacon.specs.geojson]
            [clojure.spec.gen :as gen]
            [clojure.spec :as spec])
  (:import (com.boundlessgeo.spatialconnect.schema SCCommand)))

(use-fixtures :once utils/setup-fixtures)

(deftest location-update-persisted-test
  (testing "When a location is sent on the /store/tracking topic, it is persisted"
    (let [mqtt (:mqtt user/system-val)
          loc  (gen/generate (spec/gen :spacon.specs.geojson/pointfeature-spec))
          device-id (->> (utils/request-get "/api/devices") :result first :identifier)
          payload (assoc loc :metadata {:client device-id})
          m (scm/map->SCMessage {:action (.value SCCommand/NO_ACTION)
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

