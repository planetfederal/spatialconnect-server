(ns spacon.util.json
  (:require [clojure.data.json :as json]
            [camel-snake-kebab.extras :refer [transform-keys]]
            [camel-snake-kebab.core :refer :all]))

(defn key->kebabkeyword [key]
  (->kebab-case-keyword (keyword key)))

(defn key->camelkeyword [key]
  (->camelCaseKeyword (keyword key)))

(defn json->kebab [jsonstr]
  (json/read-str jsonstr :key-fn ->kebab-case-keyword))

(defn json->camelCase [jsonstr]
  (json/read-str jsonstr :key-fn ->camelCaseKeyword))

(defn map->jsonrequest [m]
  (json/write-str (transform-keys ->snake_case_keyword m)))
