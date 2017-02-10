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
            [spacon.http.intercept :refer [common-interceptors]]
            [spacon.http.response :as response]
            [spacon.http.auth :refer [check-auth]]
            [spacon.components.form.db :as formmodel]
            [spacon.components.mqtt.core :as mqttapi]
            [clojure.spec :as s]
            [clojure.spec.gen :as gen]
            [spacon.components.mqtt.core :as mqttapi]
            [spacon.components.trigger.core :as triggerapi]
            [spacon.entity.scmessage :as scm]
            [clojure.tools.logging :as log]
            [clojure.data.json :as json])
  (:import java.net.URLDecoder
           (com.boundlessgeo.spatialconnect.schema SCCommand)))

(defn http-get-all-forms
  "Returns the latest version of each form"
  [request]
  (let [user (get-in request [:identity :user])
        team-ids (map :id (:teams user))]
    (log/debugf "Getting all forms for %s" (:email user))
    (response/ok (filter #(> (.indexOf team-ids (:team-id %)) -1)
                         (formmodel/all)))))

(defn http-get-form
  "Gets the latest version of a form by its form-key"
  [request]
  (log/debug "Getting form by form-key")
  ;; todo, we should check form_key and team_id in the query
  (let [form-key (get-in request [:path-params :form-key])]
    (response/ok (formmodel/find-latest-version form-key))))

(defn http-post-form
  "Creates a new form using the json body then publishes a
  config update message about the newly added form"
  [mqtt request]
  (let [form (:json-params request)]
    (log/debug "Validating form")
    (if (s/valid? :spacon.specs.form/form-spec form)
      (let [new-form (formmodel/add-form-with-fields form)]
        (log/debug "Added new form")
        (mqttapi/publish-scmessage mqtt
                                   "/config/update"
                                   (scm/map->SCMessage
                                    {:action (.value SCCommand/CONFIG_ADD_FORM)
                                     :payload new-form}))
        (response/ok new-form))
      (let [reason (s/explain-str :spacon.specs.form/form-spec form)
            err-msg "Failed to create new form"]
        (log/error (str err-msg " because " reason))
        (response/bad-request err-msg)))))

(defn- delete-form
  [form]
  (formmodel/delete (:id form)))

(defn http-delete-form-by-key
  "Deletes all forms matching the form-key then publishes a
  config update message about the deleted form"
  [mqtt request]
  (log/debug "Deleting form")
  (let [form-key (URLDecoder/decode (get-in request [:path-params :form-key])
                                    "UTF-8")
        forms (formmodel/find-by-form-key form-key)]
    (if (zero? (count forms))
      (let [err-msg (str "No forms found for form-key" form-key)]
        (log/error err-msg)
        (response/bad-request err-msg))
      (if (== (count (map delete-form forms)) (count forms))
        (do
          (mqttapi/publish-scmessage mqtt
                                     "/config/update"
                                     (scm/map->SCMessage
                                      {:action (.value SCCommand/CONFIG_REMOVE_FORM)
                                       :payload {:form-key form-key}}))
          (response/ok "success"))
        (let [err-msg (str "Failed to delete all form versions for form-key" form-key)]
          (log/error err-msg)
          (response/error err-msg))))))

(defn http-submit-form-data
  "Creates a form submission using the json body"
  [request]
  (log/debug "Submitting form data")
  (let [form-id   (Integer/parseInt (get-in request [:path-params :form-id]))
        form-data (get-in request [:json-params])
        device-id (:device-id form-data)] ;; todo: device-id is not sent yet so this will always be nil
    (formmodel/add-form-data form-data form-id device-id)
    (response/ok "data submitted successfully")))

(defn http-get-form-results
  "Gets the form submissions for given form"
  [request]
  (log/debug "Fetching form data")
  (let [form-id (get-in request [:path-params :form-id])]
    (response/ok (formmodel/get-form-data form-id))))

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

(defn generate-data-for-form
  "Generates a sample GeoJSON point feature with properties that
  conform to the form's schema"
  [form-id]
  (let [form-fields (formmodel/find-fields {:form_id (Integer/parseInt form-id)})]
    (gen/generate
     (gen/fmap
      (fn [feature] (assoc feature :properties (make-properties-from-fields form-fields)))
      (s/gen :spacon.specs.geojson/pointfeature-spec)))))

(defn http-get-sample-form-data
  "Generates a sample form submission for a given form"
  [request]
  (let [form-id (get-in request [:path-params :form-id])
        form-key (-> (formmodel/find-by-id (Integer/parseInt form-id)) first :form_key)]
    (log/debugf "Generating sample data for form %s" form-id)
    (let [feature-data (generate-data-for-form form-id)]
      (response/ok-without-snake-case {:form-key form-key
                                       :form-id form-id
                                       :feature feature-data}))))

(defn mqtt->form-submit
  "MQTT message handler that submits new form data using the payload
  of the message body"
  [trigger message]
  (log/debug "Handling form submission")
  (let [p (:payload message)
        form-id (:form-id p)
        form-data (:feature p)
        device-identifier (:client (:metadata form-data))]
    (triggerapi/test-value trigger "FORM_STORE" form-data)
    (log/debug "Submitting form data")
    (formmodel/add-form-data form-data form-id device-identifier)))

(defn- routes [mqtt]
  #{["/api/forms"                :get    (conj common-interceptors check-auth `http-get-all-forms)]
    ["/api/forms"                :post   (conj common-interceptors check-auth (partial http-post-form mqtt)) :route-name :create-form]
    ["/api/forms/:form-key"      :delete (conj common-interceptors check-auth (partial http-delete-form-by-key mqtt)) :route-name :delete-form]
    ["/api/forms/:form-key"      :get    (conj common-interceptors check-auth `http-get-form)]
    ;; todo: need to figure out why forms causes a route conflict
    ["/api/form/:form-id/submit"  :post  (conj common-interceptors check-auth `http-submit-form-data) :constraints {:form-id #"[0-9]+"}]
    ["/api/form/:form-id/results" :get   (conj common-interceptors check-auth `http-get-form-results) :constraints {:form-id #"[0-9]+"}]
    ["/api/form/:form-id/sample"  :get   (conj common-interceptors check-auth `http-get-sample-form-data) :constraints {:form-id #"[0-9]+"}]})

(defrecord FormComponent [mqtt trigger]
  component/Lifecycle
  (start [this]
    (log/debug "Starting Form Component")
    (mqttapi/subscribe mqtt "/store/form" (partial mqtt->form-submit trigger))
    (assoc this :routes (routes mqtt)))
  (stop [this]
    (log/debug "Starting Form Component")
    this))

(defn make-form-component []
  (map->FormComponent {}))
