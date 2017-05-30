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

(ns spacon.components.form.db
  (:require [spacon.db.conn :as db]
            [yesql.core :refer [defqueries]]
            [clojure.spec :as s]
            [clojure.java.jdbc :as jdbc]
            [clojure.data.json :as json]
            [spacon.specs.form]
            [camel-snake-kebab.core :refer :all]
            [camel-snake-kebab.extras :refer [transform-keys]]
            [spacon.util.db :as dbutil]))

;; define sql queries as functions in this namespace
(defqueries "sql/form.sql" {:connection db/db-spec})

(defn sanitize
  ; Sanitized the result from a DB query
  [form]
  (->> (dissoc form :created_at :updated_at :deleted_at :form_id)
       (remove #(nil? (val %)))
       (into {})))

(defn find-by-form-key [form-key]
  (find-by-form-key-query {:form_key form-key}))

(defn find-by-id [id]
  (find-by-id-query {:id id}))

(defn add-form-data [val form-id device-identifier]
  (add-form-data<! {:val     (json/write-str val)
                    :form_id form-id
                    :device_identifier device-identifier}))

(defn get-form-data [form-key]
  (map sanitize (get-form-data-all-query
                 {:form_key form-key})))

(defn get-form-data-version [form-key form-version]
  (map sanitize (get-form-data-version-query
                  {:form_key form-key
                   :form_version (Integer/parseInt form-version)})))

(defn form-fields
  "Gets the fields for a specific form"
  [form]
  (assoc form :fields
         (map sanitize (find-fields {:form_id (:id form)}))))

(defn delete [form-id]
  (delete! {:id form-id}))

(defn form-metadata
  "Gets the metadata about the form data"
  [form]
  (let [stats (-> (form-data-stats-query {:form_id (:id form)})
                  first)]
    (assoc form :metadata {:count        (:count stats)
                           :lastActivity (:updated_at stats)})))

(defn find-latest-version
  [form-key]
  (->> (find-latest-version-query {:form_key form-key})
       first
       sanitize
       form-fields
       form-metadata))

(defn all []
  (->> (forms-list-query)
       (group-by :form_key)
       vals
       (map #(apply max-key :version %))
       (map sanitize)
       (map form-fields)
       (map form-metadata)))

(defn add-form-with-fields
  [form]
  (jdbc/with-db-transaction [tx db/db-spec]
    (let [fields   (:fields form)
          form-key (:form_key form)
          tnx      {:connection tx}
          version  (some->
                    (find-latest-version form-key)
                    :version
                    inc)
          new-form (create<! {:form_key   form-key
                              :form_label (or
                                           (:form_label form)
                                           form-key)
                              :version    (or version 1)
                              :team_id    (:team_id form)}
                             tnx)
          new-fields (doall
                      (map
                       (fn [fs]
                         (create-form-fields<!
                          {:form_id           (:id new-form)
                           :field_key         (:field_key fs)
                           :field_label       (:field_label fs)
                           :type              (:type fs)
                           :position          (:position fs)
                           :is_required       (:is_required fs)
                           :constraints       (json/write-str (:constraints fs))}
                          tnx)) fields))
          sanitized-fields (map #(sanitize %) new-fields)]
      (assoc (sanitize new-form) :fields sanitized-fields))))

(s/fdef all
        :args empty?
        :ret (s/coll-of :spacon.specs.form/form-spec))

(s/fdef add-form-with-fields
        :args (s/cat :form :spacon.specs.form/form-spec)
        :ret (s/spec :spacon.specs.form/form-spec))