(ns spacon.trigger.protocol)

(defprotocol IClause
  (field-path [this])
  (predicate [this])
  (check [this value])
  (notification [this v]))
