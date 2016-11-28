(ns spacon.entity.trigger)

(defrecord Trigger [name description source recipients rules repeated])

(defn make-trigger [t]
  (map->Trigger t))

