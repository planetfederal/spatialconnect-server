(ns spacon.models.user
  (:require [spacon.db.conn :as db]
            [yesql.core :refer [defqueries]]
            [clojure.spec :as s]))

;; define sql queries as functions
(defqueries "sql/user.sql" {:connection db/db-spec})

;; define specs about user
(def email-regex #"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$")
(s/def ::email-type (s/and string? #(re-matches email-regex %)))
(s/def ::email ::email-type)
(s/def ::password string?)
(s/def ::name string?)
(s/def ::spec (s/keys :req-un [::email ::password]
                      :opt-un [::name]))

(defn sanitize [user]
  (dissoc user :password :created_at :updated_at :deleted_at))