(ns spacon.components.form.core
  (:require [com.stuartsierra.component :as component]
            [spacon.http.intercept :refer [common-interceptors]]
            [spacon.http.response :as response]
            [spacon.http.auth :refer [check-auth]]
            [spacon.components.form.db :as formmodel]
            [spacon.components.mqtt.core :as mqttapi]
            [clojure.spec :as s]
            [spacon.components.mqtt.core :as mqttapi]
            [spacon.components.trigger.core :as triggerapi]
            [spacon.entity.scmessage :as scm]
            [clojure.tools.logging :as log])
  (:import java.net.URLDecoder
           (com.boundlessgeo.spatialconnect.schema SCCommand)))

(defn http-get-all-forms
  "Returns the latest version of each form"
  [_]
  ;; todo: get all the forms for all the teams that the calling user belongs to
  (log/debug "Getting all forms")
  (response/ok (formmodel/all)))

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
  (let [form (get-in request [:json-params])]
    (log/debug "Validating form")
    (if (s/valid? :spacon.specs.form/form-spec form)
      (let [new-form (formmodel/add-form-with-fields form)]
        (log/debug "Adding new form")
        (mqttapi/publish-scmessage mqtt
                                   "/config/update"
                                   (scm/map->SCMessage
                                    {:action (.value SCCommand/CONFIG_ADD_FORM)
                                     :payload new-form}))
        (response/ok new-form))
      (let [err-msg "Failed to create new form"]
        (log/error err-msg)
        (response/error err-msg)))))

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
    (if (== (count (map delete-form forms)) (count forms))
      (do
        (mqttapi/publish-scmessage mqtt
                                   "/config/update"
                                   (scm/map->SCMessage
                                    {:action (.value SCCommand/CONFIG_REMOVE_FORM)
                                     :payload {:form-key form-key}}))
        (response/ok "success"))
      (do
        (log/error "Failed to delete form")
        (response/error (str "Failed to delete form"))))))

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
  #{["/api/forms"                :get    (conj common-interceptors `http-get-all-forms)]
    ["/api/forms"                :post   (conj common-interceptors check-auth (partial http-post-form mqtt)) :route-name :create-form]
    ["/api/forms/:form-key"      :delete (conj common-interceptors check-auth (partial http-delete-form-by-key mqtt)) :route-name :delete-form]
    ["/api/forms/:form-key"      :get    (conj common-interceptors check-auth `http-get-form)]
    ;; todo: need to figure out why forms causes a route conflict
    ["/api/form/:form-id/submit"   :post   (conj common-interceptors check-auth `http-submit-form-data) :constraints {:form-id #"[0-9]+"}]
    ["/api/form/:form-id/results"  :get   (conj common-interceptors check-auth `http-get-form-results) :constraints {:form-id #"[0-9]+"}]})

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
