(ns spacon.components.http.team
  (:require [clojure.tools.logging :as log]
            [spacon.components.http.response :as response]
            [spacon.components.http.intercept :as intercept]
            [spacon.components.team.core :as teamapi]))

(defn http-get-all-teams
  "Returns http response of all teams"
  [team-comp _]
  (log/debug "Getting all teams")
  (response/ok (teamapi/all team-comp)))

(defn http-get-team
  "Gets team by id"
  [team-comp request]
  (log/debug "Getting team by id")
  (let [id (get-in request [:path-params :id])]
    (if-let [team (teamapi/find-by-id team-comp id)]
      (response/ok team)
      (let [err-msg (str "No team found for id" id)]
        (log/warn err-msg)
        (response/ok err-msg)))))

(defn http-post-team
  "Creates a new team using the json body"
  [team-comp request]
  (if-let [team (teamapi/create team-comp (:json-params request))]
    (response/ok team)
    (let [err-msg "Failed to create new team"]
      (log/error err-msg)
      (response/error err-msg))))

(defn http-delete-team
  "Deletes a team"
  [team-comp request]
  (log/debug "Deleting team")
  (teamapi/delete team-comp (get-in request [:path-params :id]))
  (response/ok "success"))

(defn routes [team-comp] #{["/api/teams" :get
                    (conj intercept/common-interceptors (partial http-get-all-teams team-comp)) :route-name :get-teams]
                   ["/api/teams/:id" :get
                    (conj intercept/common-interceptors (partial http-get-team team-comp)) :route-name :get-team]
                   ["/api/teams" :post
                    (conj intercept/common-interceptors (partial http-post-team team-comp)) :route-name :post-team]
                   ["/api/teams/:id" :delete
                    (conj intercept/common-interceptors (partial http-delete-team team-comp)) :route-name :delete-team]})

