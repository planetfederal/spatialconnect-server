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

(defn add-form-with-fields!
  [form]
  (jdbc/with-db-transaction [tx db/db-spec]
    (let [fields   (:fields form)
          team-id  (:team_id form)
          form-key (:form_key form)
          tnx      {:connection tx}
          version  (some-> (find-latest-version {:form_key form-key :team_id team-id} tnx)
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
          sanitized-fields (map #(dissoc % :created_at :updated_at :deleted_at :form_id) new-fields)]
      (assoc new-form :fields sanitized-fields))))



