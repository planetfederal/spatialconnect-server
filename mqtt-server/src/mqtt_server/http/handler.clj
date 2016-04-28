(ns mqtt-server.http.handler
  (:use uuid.core)
  (:require
    [compojure.core :refer :all]
    [ring.middleware.json :refer :all]
    [ring.util.response :refer [response]]
    [ring.util.io :refer [string-input-stream]]
    [ring.middleware.defaults :refer :all]
    [mqtt-server.models.config :as config]
    [mqtt-server.models.stores :as store]
    [mqtt-server.models.forms :as form]
    [mqtt-server.models.devices :as device]))

(defn wrap-log-request [handler]
  (fn [req]
    (println req)
    (handler req)))

(defn- form->tcombschema [f]
  (let [formdefs (form/formdef-by-id (get f :id))
        config-id (get f :config_id)]
    {:id (get f :id)
     :name (get f :name)
     :schema {:type "object"
              :properties
                    (map (fn [formdef]
                           {(get formdef :fdlabel) {:type (get formdef :fdtype)}}) formdefs)
              :required (map (fn [v] (first (vals v))) ( form/required (get f :id)))}}))

(defn- formlist->tcombschema [config-id]
  (let [fs (form/form-list config-id)]
    (map form->tcombschema fs)
    ))

(defn- formData->configOutput [fc]
  (let [data (form/formdata-for-form-id (get fc :id))
        dataVal (into {} (map (fn [d] {(keyword (get d :label))  (get d :val)}) data))]
    {:formID (get fc :id)
     :data dataVal
     :id (get fc :id)}))

(defn- formDataOutput [config-id]
  (let [formlist (form/form-list config-id)]
    (map formData->configOutput formlist)))

(defn buildconfig [config-id]
  {:stores (map (fn [m] (dissoc m :config_id)) (store/store-list config-id))
   :forms (formlist->tcombschema config-id)
   :formData (formDataOutput config-id)})

(defn body-request->map [handler]
  (fn [req]
    (let [data-payload (into {} (map (fn [v] {(keyword (first v)) (second v)}) (get req :body)))
          new-req (assoc req :body data-payload)]
      (handler new-req))))

(defroutes app-routes
  (context "/config" []
    (GET "/" [] (response (config/config-list)))
    (GET "/:cid" [cid] (response (buildconfig (read-string cid))))
    (POST "/" [] (fn [{data :body}] (response (config/create-config (get data :name)))))
    (PUT "/:cid" [cid] (fn [{data :body}]
                         (response (config/update-config (read-string cid) (get data :name)))))
    (context "/:cid/store" [cid]
      (routes
        (GET "/" [] (response (store/store-list (read-string cid))))
        (GET "/:sid" [sid] (response (store/store-by-id (uuid sid))))
        (PUT "/:sid" [] (fn [{data :body}] (response (store/update-store data))))
        (POST "/" [] (fn [{data :body}] (response (store/create-store data))))
        (DELETE "/:sid" [sid] (store/delete-store (read-string sid)))))
    (context "/:cid/form" [cid]
      (routes
        (GET "/" [] (response (form/form-list (read-string cid))))
        (GET "/:fid" [fid] (response (form/form-by-id (read-string fid))))
        (PUT "/:fid" [fid] (response (form/update-form ())))
        (POST "/" [] (fn [{data :body}] (response (form/create-form data (read-string cid)))))
        (DELETE "/:fid" [fid] (response (form/delete-form (read-string fid))))))
    (context "/:cid/device" [cid]
      (routes
        (GET "/" [] (response (device/device-list (read-string cid))))
        (GET "/:did" [did] (response (device/find-by-id (read-string did))))
        (PUT "/:did" [] (fn [{data :body}] (response (device/update-device data))))
        (POST "/" [] (fn [{data :body}] (response (device/create-device data))))
        (DELETE "/:did" [did] (device/delete-device (read-string did)))))))

(def app
  (-> app-routes
      wrap-log-request
      body-request->map
      wrap-json-response
      wrap-json-body))