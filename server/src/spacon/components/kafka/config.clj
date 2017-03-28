(ns spacon.components.kafka.config
  (:require [spacon.components.config.core :as configapi]
            [clojure.tools.logging :as log]))

(defn config-request
  [config-comp cmessage]
  (log/debug "Getting Config")
  (let [d (configapi/create-config config-comp (get-in request [:identity :user])))]))

