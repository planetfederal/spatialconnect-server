(ns spacon.models.form
  (:require [spacon.db.conn :as db]
            [yesql.core :refer [defqueries]]
            [clojure.spec :as s]
            [clojure.java.jdbc :as jdbc]))

;; define sql queries as functions
(defqueries "sql/form.sql" {:connection db/db-spec})

(s/def ::form_key string?)
(s/def ::form_label string?)
(s/def ::version pos-int?)
(s/def ::team_id pos-int?)
(s/def ::spec (s/keys :req-un [::form_key ::version ::team_id]
                      :opt-un [::form_label]))

(s/def ::device_id pos-int?)
(s/def ::form_id pos-int?)
(s/def ::form_data (s/keys :req-un [::device_id ::form_id]))

(defn sanitize [form]
  (into {} (remove #(nil? (val %))
                   (dissoc form :created_at :updated_at :deleted_at :form_id))))

(defn find-by-form-key [form-key]
  (find-by-form-key-query {:form_key form-key}))

(defn add-form-data [val form-id device-id]
  (add-form-data<! {:val val
                    :form_id form-id
                    :device_id device-id}))

(defn form-fields
  "Gets the fields for a specific form"
  [form]
  (assoc form :fields (map sanitize (find-fields {:form_id (:id form)}))))

(defn delete [form-id]
  (delete! {:id form-id}))

(defn form-metadata
  "Gets the metadata about the form data"
  [form]
  (let [stats (-> (form-data-stats-query {:form_id (:id form)})
                  first)]
    (assoc form :metadata {:count        (:count stats)
                           :lastActivity (:updated_at stats)})))

(defn find-latest-version [form-key]
  (find-latest-version-query {:form_key form-key}))

(defn forms-list []
  (->> (forms-list-query)
       (group-by :form_key)
       vals
       (map #(apply max-key :version %))
       (map sanitize)
       (map form-fields)
       (map form-metadata)))

(defn add-form-with-fields!
  [form]
  (jdbc/with-db-transaction [tx db/db-spec]
    (let [fields   (:fields form)
          team-id  (:team_id form)
          form-key (:form_key form)
          tnx      {:connection tx}
          version  (some-> (find-latest-version-query {:form_key form-key} tnx)
                           first
                           :version
                           inc)
          new-form (create<! {:form_key   form-key
                              :form_label (or (:form_label form) form-key)
                              :version    (or version 1)
                              :team_id    team-id}
                             tnx)
          new-fields (doall (map #(create-form-fields<! {:form_id           (:id new-form)
                                                         :field_key         (:field_key %)
                                                         :field_label       (:field_label %)
                                                         :type              (:type %)
                                                         :position          (:position %)
                                                         :is_required       (:is_required %)
                                                         :initial_value     (:initial_value %)
                                                         :is_integer        (:is_integer %)
                                                         :pattern           (:pattern %)
                                                         :options           (:options %)
                                                         :minimum           (:minimum %)
                                                         :maximum           (:maximum %)
                                                         :minimum_length    (:minimum_length %)
                                                         :maximum_length    (:maximum_length %)
                                                         :exclusive_minimum (:exclusive_minimum %)
                                                         :exclusive_maximum (:exclusive_maximum %)}
                                                        tnx)
                                 fields))
          sanitized-fields (map #(sanitize %) new-fields)]
      (assoc new-form :fields sanitized-fields))))



