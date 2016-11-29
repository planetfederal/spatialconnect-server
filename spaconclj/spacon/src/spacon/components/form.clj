(ns spacon.components.form
  (:require [com.stuartsierra.component :as component]
            [spacon.http.intercept :refer [common-interceptors]]
            [spacon.http.response :as response]
            [spacon.http.auth :refer [check-auth]]
            [spacon.models.form :as formmodel]
            [clojure.spec :as s]
            [clojure.data.json :as json])
  (:import java.net.URLDecoder))

(defn http-get-all-forms
  ;; todo: get all the forms for all the teams that the calling user belongs to
  [_]
  ;; select the latest version of each form by the form_key
  (response/ok formmodel/forms-list))

(defn http-get-form-by-form-key
  [request]
  ;; todo, we should check form_key and team_id in the query
  (let [form-key (get-in request [:path-params :form-key])
        forms    (->> (formmodel/find-latest-version form-key)
                      first
                      formmodel/sanitize
                      formmodel/form-fields
                      formmodel/form-metadata)]
    (response/ok forms)))

(defn http-create-form
  "Creates a new form."
  [request]
  (let [body    (get-in request [:json-params])
        team-id (:team_id body)
        form    (assoc  body :team_id team-id)]
      (if (s/valid? :spacon.models.form/spec form)
        (let [new-form (formmodel/add-form-with-fields! form)]
             (response/ok (formmodel/sanitize new-form)))
        (response/bad-request (str "failed to create form:" (s/explain-str :spacon.models.form/spec form))))))

(defn delete-form-by-id
  [form]
  (formmodel/delete (:id form)))

(defn http-delete-form-by-key
  "Deletes all forms matching the form-key"
  [request]
  (let [form-key (URLDecoder/decode (get-in request [:path-params :form-key]))
        forms    (formmodel/find-by-form-key form-key)]
    (doall (map delete-form-by-id forms))
    (response/ok (str "Deleted form " form-key))))

(defn submit-form-data
  [request]
  (let [form-id   (get-in request [:path-params :form-id])
        form-data (get-in request [:json-params])
        device-id (:device-id form-data)] ;; todo: device-id is not sent yet so this will always be nil
    (formmodel/add-form-data (json/write-str form-data)
                             (Integer/parseInt form-id)
                              device-id)
    (response/ok "data submitted successfully")))

(defn- routes []
  #{["/api/forms"                :get    (conj common-interceptors `http-get-all-forms)]
    ["/api/forms"                :post   (conj common-interceptors check-auth `http-create-form)]
    ["/api/forms/:form-key"      :delete (conj common-interceptors check-auth `http-delete-form-by-key)]
    ["/api/forms/:form-key"      :get    (conj common-interceptors check-auth `http-get-form-by-form-key)]
    ;; todo: need to figure out why forms causes a route conflict
    ["/api/form/:form-id/submit" :post   (conj common-interceptors check-auth `submit-form-data) :constraints {:form-id #"[0-9]+"}]})

(defrecord FormComponent []
  component/Lifecycle
  (start [this]
    (assoc this :routes (routes)))
  (stop [this]
    this))

(defn make-form-component []
  (map->FormComponent {}))