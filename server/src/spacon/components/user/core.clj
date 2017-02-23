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

(ns spacon.components.user.core
  (:require [com.stuartsierra.component :as component]
            [io.pedestal.interceptor.helpers :refer [defhandler]]
            [spacon.components.user.db :as usermodel]
            [spacon.components.http.auth :refer [check-auth]]
            [clojure.tools.logging :as log]))

(defn all
  [_]
  (usermodel/all))

(defn create
  [_ u]
  (usermodel/create u))

(defn add-user-team
  [_ team]
  (usermodel/add-user-team (:user-id team) (:team-id team)))

(defn remove-user-team
  [_ team]
  (usermodel/remove-user-team (:user-id team) (:team-id team)))

(defrecord UserComponent []
  component/Lifecycle
  (start [this]
    (log/debug "Starting User Component")
    this)
  (stop [this]
    (log/debug "Stopping User Component")
    this))

(defn make-user-component []
  (->UserComponent))
