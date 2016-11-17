(ns spacon.components.form
  (:require [com.stuartsierra.component :as component]
            [spacon.http.intercept :refer [common-interceptors]]
            [spacon.http.response :as response]
            [io.pedestal.interceptor.helpers :refer [defhandler]]
            [spacon.http.auth :refer [check-auth]]
            [spacon.models.form :as form]
            [clojure.spec :as s])
  (:import java.net.URLDecoder))

(defn get-form-fields
  "Gets the fields for a specific form"
  [form]
  (assoc form :fields (map form/sanitize (form/find-fields {:form_id (:id form)}))))

(defn get-form-metadata
  "Gets the metadata about the form data"
  [form]
  (let [stats (-> (form/get-form-data-stats {:form_id (:id form)})
                  first)]
    (assoc form :metadata {:count        (:count stats)
                           :lastActivity (:updated_at stats)})))

(defhandler get-all-forms
  ;; todo: get all the forms for all the teams that the calling user belongs to
  [request]
  ;; select the latest version of each form by the form_key
  (let [forms (->> (form/find-all)
                   (group-by :form_key)
                   vals
                   (map #(apply max-key :version %))
                   (map form/sanitize)
                   (map get-form-fields)
                   (map get-form-metadata))]
    (response/ok forms)))


(defhandler create-form
  "Creates a new form."
  [request]
  (let [team_id (get-in request [:json-params :team_id])
        form    (assoc (:json-params request) :team_id team_id)]
      (if (s/valid? :spacon.models.form/spec form)
        (let [new-form (form/add-form-with-fields! form)]
             (response/ok (form/sanitize new-form)))
        (response/bad-request (str "failed to create form:" (s/explain-str :spacon.models.form/spec form))))))

(defn delete-form-by-id
  [form]
  (form/delete! {:id (:id form)}))

(defhandler delete-form-by-key
  "Deletes all forms matching the form-key"
  [request]
  (let [form-key (URLDecoder/decode (get-in request [:path-params :form-key]))
        forms    (form/find-by-form-key {:form_key form-key})]
    (doall (map delete-form-by-id forms))
    (response/ok (str "Deleted form " form-key))))

(defhandler submit-form-data
  [request]
  (let [form-id   (get-in request [:path-params :form-id])
        form-data (get-in request [:json-params])
        device-id (:device-id form-data)] ;; todo: device-id is not sent yet so this will always be nil
    (form/add-form-data<! {:val       form-data
                           :form_id   (Integer/parseInt form-id)
                           :device_id device-id})
    (response/ok)))

(defn- routes []
  #{["/api/forms"                 :get    (conj common-interceptors check-auth `get-all-forms)]
    ["/api/forms"                 :post   (conj common-interceptors check-auth `create-form)]
    ["/api/forms/:form-key"      :delete (conj common-interceptors check-auth `delete-form-by-key)]
    ;; todo: need to figure out why forms causes a route conflict
    ["/api/form/:form-id/submit" :post   (conj common-interceptors check-auth `submit-form-data)  :constraints {:form-id #"[0-9]+"}]})

(defrecord FormComponent []
  component/Lifecycle
  (start [this]
    (assoc this :routes (routes)))
  (stop [this]
    this))

(defn make-form-component []
  (map->FormComponent {}))