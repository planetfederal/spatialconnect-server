(ns spacon.generate-data
  (:gen-class))

(defn generate-sample-data []
  (let [org (clojure.spec/exercise-fn `spacon.components.organization.db/create)
        team (clojure.spec/exercise-fn `spacon.components.team.db/create)
        store (clojure.spec/exercise-fn `spacon.components.store.db/create)
        form (clojure.spec/exercise-fn `spacon.components.form.db/add-form-with-fields)
        dev (clojure.spec/exercise-fn `spacon.components.device.db/create)
        trigger (clojure.spec/exercise-fn `spacon.components.trigger.db/create)]
    (+ (count org) (count team) (count store) (count form) (count dev) (count trigger))))

(defn -main
  "The entry-point for 'lein generate-data'"
  [& _]
  (println "\nGenerating your data...")
  (println (generate-sample-data) " items created")
  (println "\nData generation complete"))