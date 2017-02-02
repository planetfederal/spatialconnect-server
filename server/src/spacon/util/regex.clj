(ns spacon.util.regex)

(def email #"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$")
(def double #"(?:\d*\.)?\d+")
(def int #"\d")
