(ns spacon.entity.notification)

(defrecord Notification [output-type to priority title body payload])

(defn make-email-notification
  "Takes a map of a notification and returns a Notification record for email"
  [n]
  (map->Notification (assoc n :output-type :email)))

(defn make-mobile-notification
  "Takes a map of a notification and returns a Notification record for mobile"
  [n]
  (map->Notification (assoc n :output-type :mobile)))
