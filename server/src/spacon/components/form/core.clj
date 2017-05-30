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

(ns spacon.components.form.core
  (:require [com.stuartsierra.component :as component]
            [spacon.components.form.db :as formmodel]
            [spacon.components.queue.protocol :as queueapi]
            [clojure.spec :as s]
            [clojure.spec.gen :as gen]
            [clojure.tools.logging :as log]
            [cljts.io :as jtsio]
            [clojure.data.json :as json]
            [spacon.entity.msg :as msg]))

(defn delete-form
  [form-comp form]
  (formmodel/delete (:id form)))

(defn find-by-form-key
  [form-comp form-key]
  (formmodel/find-by-form-key form-key))

(defn get-value-for-field
  "Generates a random value for a field based on its type"
  [field]
  (case (:type field)
    "string"  (gen/generate (gen/string-alphanumeric))
    "number"  (gen/generate (s/gen number?))
    "date"    (gen/generate (gen/string-alphanumeric))
    "boolean" (gen/generate (s/gen boolean?))
    "select"  (gen/generate (gen/string-alphanumeric))
    "slider"  (gen/generate (gen/string-alphanumeric))
    "counter" (gen/generate (s/gen pos-int?))
    "photo"   (gen/generate (gen/string-alphanumeric))))

(defn make-properties-from-fields
  "Makes a hash map of properties for all the form fields"
  [form-fields]
  (let [keys (map #(keyword (:field_key %)) form-fields)
        vals (map get-value-for-field form-fields)]
    (zipmap keys vals)))

(defn all
  [form-comp]
  (formmodel/all))

(defn find-latest-version
  [_ form-key]
  (formmodel/find-latest-version form-key))

(defn get-form-by-id
  [_ form-id]
  (let [form (formmodel/find-by-id (Integer/parseInt form-id))]
    form))

(defn get-form-data
  "Retrieves data for a specific form"
  [form-comp form-key]
  (formmodel/get-form-data form-key))

(defn get-form-data-version
  "Retrieves data for a specific form"
  [form-comp form-key form-version]
  (formmodel/get-form-data-version form-key form-version))

(defn add-form-data
  [form-comp form-data form-id device-id]
  (let [gj (-> form-data
               json/write-str
               jtsio/read-feature
               .getDefaultGeometry)]
    (formmodel/add-form-data form-data form-id device-id)))

(defn add-form-with-fields
  [form-comp form]
  (formmodel/add-form-with-fields form))

(defn generate-data-for-form
  "Generates a sample GeoJSON point feature with properties that
  conform to the form's schema"
  [form-comp form-id]
  (let [form-fields (formmodel/find-fields {:form_id (Integer/parseInt form-id)})]
    (gen/generate
     (gen/fmap
      (fn [feature] (assoc feature :properties (make-properties-from-fields form-fields)))
      (s/gen :spacon.specs.geojson/pointfeature-spec)))))

(defn queue->form-submit
  "queue message handler that submits new form data using the payload
  of the message body"
  [queue-comp message]
  (log/debug "Handling form submission")
  (let [p (:payload message)
        form-id (:form_id p)
        form-data (:feature p)
        device-identifier (:client (:metadata form-data))
        gj (-> form-data
               json/write-str
               jtsio/read-feature
               .getDefaultGeometry)]
    (log/debug "Submitting form data")
    (try
      (formmodel/add-form-data form-data form-id device-identifier)
      (queueapi/publish queue-comp (msg/map->Msg
                                     {:to (:to message)
                                      :correlationId (:correlationId message)
                                      :payload {:result true :error nil}}))
      (catch Exception e
        (queueapi/publish queue-comp (msg/map->Msg
                                       {:to (:to message)
                                        :correlationId (:correlationId message)
                                        :payload {:result false :error (.getMessage e) }}))))))

(defrecord FormComponent [queue]
  component/Lifecycle
  (start [this]
    (log/debug "Starting Form Component")
    (queueapi/subscribe queue :store-form (partial queue->form-submit queue))
    (assoc this :queue-comp queue))
  (stop [this]
    (log/debug "Starting Form Component")
    this))

(defn make-form-component []
  (map->FormComponent {}))
