(defproject mqtt-server "0.1.0-SNAPSHOT"
  :description ""
  :url "http://example.com/FIXME"
  :license {:name "Eclipse Public License"
            :url "http://www.eclipse.org/legal/epl-v10.html"}
  :dependencies [
                 [org.clojure/clojure "1.7.0"],
                 [compojure "1.5.0"],
                 [ring/ring-core "1.4.0"],
                 [ring/ring-defaults "0.2.0"],
                 [ring/ring-json "0.2.0"],
                 [ring/ring-jetty-adapter "1.2.1"],
                 [ring-mock "0.1.5"],
                 [http-kit "2.1.18"],
                 [org.postgresql/postgresql "9.4-1201-jdbc4"],
                 [ragtime "0.5.3"],
                 [yesql "0.5.2"],
                 [listora/uuid "0.1.2"],
                 [clojurewerkz/machine_head "1.0.0-beta9"]]
  :dev-dependencies [
                     [lein-reload "1.0.0"]
                     ]
  :aliases {"migrate"  ["run" "-m" "mqtt-server.db/migrate"]
            "rollback" ["run" "-m" "mqtt-server.db/rollback"]}
  :plugins [
            [ragtime/ragtime.lein "0.3.6"]])