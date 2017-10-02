(ns spacon.components.http.form
  (:require [spacon.components.http.response :as response]
            [clojure.tools.logging :as log]
            [spacon.components.http.intercept :refer [common-interceptors]]
            [spacon.components.form.core :as formapi]
            [spacon.components.queue.protocol :as queueapi]
            [spacon.components.http.auth :refer [check-auth]]
            [spacon.entity.msg :as msg]
            [clojure.spec :as s])
  (:import (java.net URLDecoder)
           (com.boundlessgeo.schema Actions)))

(defn http-get-sample-form-data
  "Generates a sample form submission for a given form"
  [form-comp request]
  (let [form-id (get-in request [:path-params :form-id])
        form-key (-> (partial formapi/get-form-by-id form-comp) first :form_key)]
    (log/debugf "Generating sample data for form %s" form-id)
    (let [feature-data (formapi/generate-data-for-form form-comp form-id)]
      (response/ok {:form_key form-key
                    :form_id  form-id
                    :feature  feature-data}))))

(defn http-get-all-forms
  "Returns the latest version of each form"
  [form-comp request]
  (let [user (get-in request [:identity :user])
        team-ids (map :id (:teams user))]
    (log/debugf "Getting all forms for %s" (:email user))
    (response/ok (filter #(> (.indexOf team-ids (:team_id %)) -1)
                         (formapi/all form-comp)))))

(defn http-get-form
  "Gets the latest version of a form by its form-key"
  [form-comp request]
  (log/debug "Getting form by form-key")
  ;; todo, we should check form_key and team_id in the query
  (let [form-key (get-in request [:path-params :form-key])
        form (formapi/find-latest-version form-comp form-key)]
    (response/ok form)))

(defn http-post-form
  "Creates a new form using the json body then publishes a
  config update message about the newly added form"
  [form-comp queue-comp request]
  (let [f (:json-params request)
        form (if (not (contains? f :version))
               (assoc f :version 1)
               f)]
    (log/debug "Validating form")
    (if (s/valid? :spacon.specs.form/form-spec form)
      (let [new-form (formapi/add-form-with-fields form-comp form)]
        (log/debug "Added new form")
        (queueapi/publish queue-comp (msg/map->Msg
                                      {:to :config-update
                                       :action (.value Actions/CONFIG_ADD_FORM)
                                       :payload new-form}))
        (response/ok new-form))
      (let [reason (s/explain-str :spacon.specs.form/form-spec form)
            err-msg "Failed to create new form"]
        (log/error (str err-msg " because " reason))
        (response/bad-request err-msg)))))

(defn http-delete-form-by-key
  "Deletes all forms matching the form-key then publishes a
  config update message about the deleted form"
  [form-comp queue-comp request]
  (log/debug "Deleting form")
  (let [form-key (URLDecoder/decode (get-in request [:path-params :form-key])
                                    "UTF-8")
        forms (formapi/find-by-form-key form-comp form-key)]
    (if (zero? (count forms))
      (let [err-msg (str "No forms found for form-key" form-key)]
        (log/error err-msg)
        (response/bad-request err-msg))
      (if (== (count (map (partial formapi/delete-form form-comp) forms)) (count forms))
        (do
          (queueapi/publish queue-comp (msg/map->Msg
                                        {:to :config-update
                                         :action (.value Actions/CONFIG_REMOVE_FORM)
                                         :payload {:form_key form-key}}))
          (response/ok "success"))
        (let [err-msg (str "Failed to delete all form versions for form-key" form-key)]
          (log/error err-msg)
          (response/error err-msg))))))

(defn http-submit-form-data
  "Creates a form submission using the json body"
  [form-comp request]
  (log/debug "Submitting form data")
  (let [form-id   (Integer/parseInt (get-in request [:path-params :form-id]))
        form-data (get-in request [:json-params])
        device-id (:device_id form-data)] ;; todo: device-id is not sent yet so this will always be nil
    (formapi/add-form-data form-comp form-data form-id device-id)
    (response/ok "data submitted successfully")))

(defn http-get-form-results
  "Gets the form submissions for given form"
  [form-comp request]
  (log/debug "Fetching form data")
  (let [form-key (get-in request [:path-params :form-key])]
    (response/ok (formapi/get-form-data form-comp form-key))))

(defn http-get-form-results-version
  "Gets the form submissions for given form version"
  [form-comp request]
  (log/debug "Fetching form data")
  (let [form-key (get-in request [:path-params :form-key])
        form-version (get-in request [:path-params :form-version])]
    (response/ok (formapi/get-form-data-version form-comp form-key form-version))))

(defn routes [form-comp queue]
  #{["/api/forms"                :get
     (conj common-interceptors check-auth (partial http-get-all-forms form-comp)) :route-name :all-forms]
    ["/api/forms"                :post
     (conj common-interceptors check-auth (partial http-post-form form-comp queue)) :route-name :create-form]
    ["/api/forms/:form-key"      :delete
     (conj common-interceptors check-auth (partial http-delete-form-by-key form-comp queue)) :route-name :delete-form]
    ["/api/forms/:form-key"      :get
     (conj common-interceptors check-auth (partial http-get-form form-comp)) :route-name :get-form]
    ["/api/forms/:form-key/results" :get
     (conj common-interceptors check-auth (partial http-get-form-results form-comp))
     :route-name :form-results]
    ["/api/forms/:form-key/results/:form-version" :get
     (conj common-interceptors check-auth (partial http-get-form-results-version form-comp))
     :route-name :form-results-version]
    ;; todo: need to figure out why forms causes a route conflict
    ["/api/form/:form-id/submit"  :post
     (conj common-interceptors check-auth (partial http-submit-form-data form-comp))
     :route-name :submit-form :constraints {:form-id #"[0-9]+"}]
    ["/api/form/:form-id/sample" :get
     (conj common-interceptors check-auth (partial http-get-sample-form-data form-comp))
     :route-name :sample-form-data :constraints {:form-id #"[0-9]+"}]})
