(ns mqtt-server.http.handler
  (:use uuid.core)
  (:require
    [compojure.core :refer :all]
    [ring.middleware.json :refer :all]
    [ring.util.response :refer [response]]
    [ring.util.io :refer [string-input-stream]]
    [ring.middleware.session :refer [wrap-session]]
    [ring.middleware.defaults :refer :all]
    [cheshire.core :as json]
    [mqtt-server.models.stores :as store]
    [mqtt-server.models.forms :as form]
    [mqtt-server.models.devices :as device]
    [mqtt-server.models.users :as user]
    [mqtt-server.auth :refer [unauthorized-handler make-token! auth-backend authenticated-user]]
    [buddy.auth.middleware :refer [wrap-authentication wrap-authorization]]
    [buddy.auth.accessrules :refer [restrict]]
    [ring.middleware.cors :refer [wrap-cors]]
    [ring.adapter.jetty :refer [run-jetty]]))

(defn wrap-log-request [handler]
  (fn [req]
    (println req)
    (handler req)))

(defn- form->tcombschema [f]
  (let [formfields (form/formfield-by-formid (get f :id))]
    (println formfields)
    {:id (f :id)
     :name (f :name)
     :fields (map (fn [formfield]
                    (into {} (map (fn [k]
                                 (if-not (nil? (get formfield k))
                                   {k (get formfield k)}))
                               (keys formfield))))
                  formfields)}))

(defn- formlist->tcombschema []
  (let [fs (form/form-list)]
    (map form->tcombschema fs)))

(defn- formData->configOutput [fc]
  (let [data (form/formdata-for-form-id (get fc :id))
        dataVal (into {} (map (fn [d] {(keyword (get d :label))  (get d :val)}) data))]
    {:formID (get fc :id)
     :data dataVal
     :id (get fc :id)}))

(defn buildconfig []
  {:stores (map (fn [m] (dissoc m)) (store/store-list))
   :forms (formlist->tcombschema)})

(defn body-request->map [handler]
  (fn [req]
    (let [data-payload (into {} (map (fn [v] {(keyword (first v)) (second v)}) (get req :body)))
          new-req (assoc req :body data-payload)]
      (handler new-req))))

(defn- check-response [val]
  (if (= val 1)
    {:success true}
    {:success false}))

(defroutes app-routes
  (GET "/config" [] (response (buildconfig)))
  (context "/:cid/store" []
    (routes
      (GET "/" [] (response (store/store-list)))
      (GET "/:sid" [sid] (response (store/store-by-id (uuid sid))))
      (PUT "/:sid" [] (fn [{data :body}] (response (store/update-store data))))
      (POST "/" [] (fn [{data :body}] (response (store/create-store data))))
      (DELETE "/:sid" [sid] (store/delete-store (read-string sid)))))
  (context "/form" []
    (routes
      (GET "/" [] (response (form/form-list)))
      (GET "/:fid" [fid] (response (form/form-by-id (read-string fid))))
      (PUT "/:fid" [fid] (response (form/update-form ())))
      (POST "/" [] (fn [{data :body}] (response (form/create-form data))))
      (DELETE "/:fid" [fid] (response (form/delete-form (read-string fid)))))
    (GET "/:fid/item" [fid] (response (form->tcombschema {:id (read-string fid)})))
    (PUT "/:fid/item/:itemid" [fid]
      (fn [{data :body}] (response (form/update-item (read-string fid) data))))
    (POST "/:fid/item" [fid] (fn [{data :body}] (response (form/add-item (read-string fid) data))))
    (DELETE "/:fid/item/:itemid" [itemid] (form/delete-item (read-string itemid)))
    (GET "/:fid/data" [fid] (fn [{data :body}] (response (formData->configOutput {:id (read-string fid)})))))
  (context "/device" []
    (routes
      (GET "/" [] (response (device/device-list)))
      (GET "/:did" [did] (response (device/find-by-id (read-string did))))
      (PUT "/:did" [] (fn [{data :body}] (response (device/update-device data))))
      (POST "/register" [] (fn [{data :body}] (response (device/create-device data))))
      (DELETE "/:did" [did] (device/delete-device (read-string did)))))
  (context "/users" []
    (POST "/" [] (fn [{data :body}] (response (user/create-user data))))
    (context "/:id" [id]
      (routes
        (GET "/" [] (response (user/find-by-id (read-string id)))))))
  (POST "/login" {{:keys [email password]} :body session :session :as req}
    (let [authdata (get-in req [:headers :authorization])]
      (if (user/check-password? email password)
        {:identity (:id email)
         :session (assoc session :identity email)
         :status 201
         :body {:auth-token (make-token! (get (user/find-by-email email) :id))}}
        {:status 409
         :session (assoc session :identity email)
         :body {:status "error"
                :message "invalid username or password"}})))
  (context "/form" []
    (POST "/:fid/submit" [fid]
      (fn [{data :body}] (check-response (form/formdata-submit (read-string fid) data))))
    (GET "/:fid/results" [fid]
      (response (form/formdata-results (read-string fid))))))


(defn wrap-user [handler]
  (fn [{user-id :identity :as req}]
    (handler (assoc req :user (user/find-by-id (get user-id :id))))))

(def app
  (-> app-routes
      (wrap-cors :access-control-allow-origin [#"http://localhost:8082"]
                 :access-control-allow-methods [:get :put :post :delete])
      (wrap-user)
      (wrap-authentication auth-backend)
      (wrap-session)
      wrap-log-request
      body-request->map
      wrap-json-response
      wrap-json-body))