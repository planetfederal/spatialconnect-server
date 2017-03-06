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

(ns spacon.generate-data
  (:gen-class))

(defn generate-sample-data []
  (let [org (clojure.spec/exercise-fn `spacon.components.organization.db/create)
        team (clojure.spec/exercise-fn `spacon.components.team.db/create)
        store (clojure.spec/exercise-fn `spacon.components.store.db/create)
        form (clojure.spec/exercise-fn `spacon.components.form.db/add-form-with-fields)
        dev (clojure.spec/exercise-fn `spacon.components.device.db/create)
    (+ (count org) (count team) (count store) (count form) (count dev))))

(defn -main
  "The entry-point for 'lein generate-data'"
  [& _]
  (println "\nGenerating your data...")
  (println (generate-sample-data) " items created")
  (println "\nData generation complete"))