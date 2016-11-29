(ns spacon.util.db
  (:require [clojure.data.json :as json]
            [clojure.java.jdbc :as jdbc])
  (:import [org.postgresql.util PGobject]))


(deftype StringArray [items]
  clojure.java.jdbc/ISQLParameter
  (set-parameter [_ stmt ix]
    (let [as-array (into-array Object items)
          jdbc-array (.createArrayOf (.getConnection stmt) "text" as-array)]
      (.setArray stmt ix jdbc-array))))

(defn format-default-layers [row]
  (if-let [r (:default_layers row)]
    (assoc row :default_layers (vec (.getArray r)))
    row))

(defn format-recipients [row]
  (if-let [r (:recipients row)]
    (assoc row :recipients (vec (.getArray r)))
    row))

(defn format-uuid [row]
  (if-let [r (:id row)]
    (assoc row :id (if (instance? java.util.UUID r) (.toString r) r))
    row))

(defn row-fn [row]
  (-> row
      format-default-layers
      format-recipients
      format-uuid))

(def result->map
  {:result-set-fn doall
   :row-fn row-fn
   :identifiers clojure.string/lower-case})

(extend-type java.sql.Timestamp
  clojure.data.json/JSONWriter
  (-write [date out]
    (clojure.data.json/-write (str date) out)))

(extend-type org.postgresql.util.PGobject
  jdbc/IResultSetReadColumn
  (result-set-read-column [val rsmeta idx]
    (let [colType (.getColumnTypeName rsmeta idx)]
      (if (contains? #{"json" "jsonb"} colType)
        (json/read-str (.getValue val) :key-fn clojure.core/keyword)
        val))))