(ns mqtt-server.models.forms
  (:require
    [yesql.core :refer [defqueries]]
    [cheshire.core :refer :all]
    [mqtt-server.db :as db :refer [db-spec]]))

(defqueries "sql/form.sql"
            {:connection db-spec})

(defn forms-count []
  (-> (forms-count-query)
      (first)
      (get :cnt)))

(defn count-form-subs [fid]
  (-> (count-form-subs-query {:formsid fid})
      (first)
      (get :cnt)))

(defn form-list []
  (forms-query))

(defn required [fid]
  (required-by-form-id-query {:form_id fid}))

(defn create-form [name]
  (create-form<! {:name name}))

(defn form-by-id [id]
  (last (form-by-id-query {:id id})))

(defn formfield-by-formid [id]
  (formfield-by-formid-query {:id id}))

(defn formfield-by-name [name]
  (formfield-by-name {:name name}))

(defn formitem-by-label [label form-id]
  (last (formitem-by-label-query {:label label :form_id form-id})))

(defn formitem-by-id [id]
  (last (formitem-by-id-query id)))

(defn form-by-name [name]
  (last (form-by-name-query {:name name})))

(defn- formdata-submit-row [form-id device-id entry]
  (let [form-field-id (get (formitem-by-label (name (key entry)) form-id) :id)]
    (formdata-submit-stmt! {:formsid form-id
                             :formfieldid form-field-id
                             :deviceid device-id
                             :val (str (val entry))})))


(defn formdata-submit [form-id data]
  (let [ident ((data :metadata) "client")
        str (generate-string data)]
    (try
       (formdata-submit-stmt! {:formsid form-id
                               :identifier ident
                               :val str})
       (catch Exception e
         (.getNextException e)
         ))))

(defn formdata-for-form-id [formsid]
  (formdata-for-form-id-query {:formsid formsid}))

(defn update-form [f]
  (update-form-query<! {:name (get f :name)
                      :id (get f :id)}))

(defn delete-form [id]
  (delete-form-query! {:id id}))

(defn add-item [fid item]
  (add-item<! {:type (get item :type)
               :label (get item :label)
               :required (get item :required)
               :form_id fid}))

(defn update-item [fid item]
  (update-item<! {:type (get item :type)
                  :label (get item :label)
                  :required (get item :required)
                  :form_id fid}))

(defn find-item [id]
  (find-item-query {:id id}))

(defn delete-item [itemid]
  (delete-item! {:id itemid}))