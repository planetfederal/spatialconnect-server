(ns spacon.entity.notification)

(defrecord Notification [output-type to priority title body payload])

(defn make-email-notification [n]
  (map->Notification (assoc n :output-type :email)))

(defn make-mobile-notification [n]
  (map->Notification (assoc n :output-type :mobile)))
