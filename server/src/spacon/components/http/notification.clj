(ns spacon.components.http.notification
  (:require [spacon.components.http.response :as response]
            [spacon.components.http.intercept :as intercept]
            [clojure.spec :as s]
            [spacon.specs.notification]
            [spacon.components.notification.core :as notifapi]))

(defn http-get-notif [notif-comp context]
  (let [id (Integer/parseInt (get-in context [:path-params :id]))]
    (response/ok (notifapi/find-notif-by-id notif-comp id))))

(defn http-send-notif
  "Send push notification, if :to is present just sent to device if not send to all devices"
  [notif-comp request]
  (let [notif-data (get-in request [:json-params])]
    (if (s/valid? :spacon.specs.notification/notify-spec notif-data)
      (do
        (if (nil? (:to notif-data))
          (notifapi/notify notif-data)
          (notifapi/notify-by-id notif-data))
        (response/ok "success"))
      (let [err  (s/explain-str :spacon.specs.notification/notify-spec notif-data)]
        (response/error err)))))

(defn routes [notif-comp]
  #{["/api/notifications/:id" :get (conj intercept/common-interceptors (partial http-get-notif notif-comp)) :route-name :get-notif]
    ["/api/notifications" :post (conj intercept/common-interceptors (partial http-send-notif notif-comp)) :route-name :send-notif]})

