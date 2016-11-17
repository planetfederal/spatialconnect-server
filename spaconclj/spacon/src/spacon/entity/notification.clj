(ns spacon.entity.notification)

(defrecord Notification [type to priority title body payload])

(defn make-email-notification [n]
  (map->Notification (assoc n :type :email)))

(defn make-mobile-notification [n]
  (map->Notification (assoc n :type :mobile)))