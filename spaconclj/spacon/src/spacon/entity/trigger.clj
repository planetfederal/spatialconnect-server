(ns spacon.entity.trigger)

(defrecord Trigger [name description recipients defintion repeated])

(defn make-trigger [t]
  (map->Trigger t))

