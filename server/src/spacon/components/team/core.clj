;; Copyright 2016-2017 Boundless, http://boundlessgeo.com
;;
;; Licensed under the Apache License, Version 2.0 (the "License");
;; you may not use this file except in compliance with the License.
;; You may obtain a copy of the License at
;;
;; http://www.apache.org/licenses/LICENSE-2.0
;;
;; Unless required by applicable law or agreed to in writing, software
;; distributed under the License is distributed on an "AS IS" BASIS,
;; WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
;; See the License for the specific language governing permissions and
;; limitations under the License.

(ns spacon.components.team.core
  (:require [com.stuartsierra.component :as component]
            [yesql.core :refer [defqueries]]
            [spacon.components.team.db :as teammodel]
            [clojure.tools.logging :as log]))

(defn all [team-comp]
  (teammodel/all))

(defn find-by-id [team-comp id]
  (teammodel/find-by-id id))

(defn create [team-comp t]
  (teammodel/create t))

(defn delete [team-comp id]
  (teammodel/delete id))

(defrecord TeamComponent []
  component/Lifecycle
  (start [this]
    (log/debug "Starting Team Component")
    this)
  (stop [this]
    (log/debug "Stopping Team Component")
    this))

(defn make-team-component []
  (->TeamComponent))
