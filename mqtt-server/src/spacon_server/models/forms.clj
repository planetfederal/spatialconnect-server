(ns mqtt-server.models.forms
  (:require
    [yesql.core :refer [defqueries]]
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

(defn form-list [cid]
  (forms-by-config-id-query {:config_id cid}))

(defn required [fid]
  (required-by-form-id-query {:form_id fid}))

(defn create-form [name config_id]
  (create-form<! {:name name :config_id config_id}))

(defn form-by-id [id]
  (last (form-by-id-query {:id id})))

(defn formdef-by-id [id]
  (formdef-by-id-query {:id id}))

(defn formdef-by-name [name]
  (formdef-by-name-query {:name name}))

(defn formitem-by-label [label form-id]
  (last (formitem-by-label-query {:label label :form_id form-id})))

(defn formitem-by-id [id]
  (last (formitem-by-id-query id)))

(defn form-by-name [name]
  (last (form-by-name-query {:name name})))

(defn- formdata-submit-row [form-id device-id entry]
  (let [form-def-id (get (formitem-by-label (name (key entry)) form-id) :id)]
    (formdata-submit-stmt! {:formsid form-id
                             :formdefid form-def-id
                             :deviceid device-id
                             :val (str (val entry))})))


(defn formdata-submit [form-id device-id data]
  (map (partial formdata-submit-row form-id device-id) data))

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