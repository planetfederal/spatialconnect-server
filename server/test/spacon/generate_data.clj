(ns spacon.generate-data
  (:gen-class)
  (:require [spacon.components.organization.db :as org]
            [spacon.test-utils :as utils]))

(defn generate-sample-data []
  (clojure.spec/exercise-fn `spacon.components.organization.db/create)
  (clojure.spec/exercise-fn `spacon.components.team.db/create)
  (clojure.spec/exercise-fn `spacon.components.store.db/create)
  (clojure.spec/exercise-fn `spacon.components.form.db/add-form-with-fields))

(defn -main
  "The entry-point for 'lein generate-data'"
  [& args]
  (println "\nGenerating your data...")
  (generate-sample-data)
  (println "\nData generation complete"))