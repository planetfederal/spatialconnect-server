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

(defn sqluuid->str [row col-name]
  (if-let [r (col-name row)]
    (assoc row col-name (if (instance? java.util.UUID r) (.toString r) r))
    row))

(defn sqlarray->vec [row col-name]
  (if-let [r (col-name row)]
    (assoc row col-name (vec (.getArray r)))
    row))

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