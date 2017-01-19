(ns spacon.util.regex)

(def email-regex #"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$")
(def double-regex #"(?:\d*\.)?\d+")
(def int-regex #"\d")
