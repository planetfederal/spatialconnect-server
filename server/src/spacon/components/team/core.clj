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
            [spacon.http.intercept :as intercept]
            [spacon.http.response :as response]
            [spacon.components.team.db :as teammodel]
            [spacon.db.conn :as db]
            [clojure.tools.logging :as log]))

(defn http-get-all-teams
  "Returns http response of all teams"
  [_]
  (log/debug "Getting all teams")
  (response/ok (teammodel/all)))

(defn http-get-team
  "Gets team by id"
  [request]
  (log/debug "Getting team by id")
  (let [id (get-in request [:path-params :id])]
    (if-let [team (teammodel/find-by-id id)]
      (response/ok team)
      (let [err-msg (str "No team found for id" id)]
        (log/warn err-msg)
        (response/ok err-msg)))))

(defn http-post-team
  "Creates a new team using the json body"
  [request]
  (if-let [team (teammodel/create (:json-params request))]
    (response/ok team)
    (let [err-msg "Failed to create new team"]
      (log/error err-msg)
      (response/error err-msg))))

(defn http-delete-team
  "Deletes a team"
  [request]
  (log/debug "Deleting team")
  (teammodel/delete (get-in request [:path-params :id]))
  (response/ok "success"))

(defn- routes [] #{["/api/teams" :get
                    (conj intercept/common-interceptors `http-get-all-teams)]
                   ["/api/teams/:id" :get
                    (conj intercept/common-interceptors `http-get-team)]
                   ["/api/teams" :post
                    (conj intercept/common-interceptors `http-post-team)]
                   ["/api/teams/:id" :delete
                    (conj intercept/common-interceptors `http-delete-team)]})

(defrecord TeamComponent []
  component/Lifecycle
  (start [this]
    (log/debug "Starting Team Component")
    (assoc this :routes (routes)))
  (stop [this]
    (log/debug "Stopping Team Component")
    this))

(defn make-team-component []
  (->TeamComponent))
