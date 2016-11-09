(defproject spacon "0.0.1-SNAPSHOT"
  :description "FIXME: write description"
  :url "http://example.com/FIXME"
  :license {:name "Eclipse Public License"
            :url "http://www.eclipse.org/legal/epl-v10.html"}
  :dependencies [[org.clojure/clojure "1.9.0-alpha14"]
                 [org.clojure/data.json "0.2.6"]
                 [io.pedestal/pedestal.service "0.5.1"]
                 [io.pedestal/pedestal.jetty "0.5.1"]
                 [ragtime "0.5.3"]
                 [yesql "0.5.2"]
                 [org.postgresql/postgresql "9.4-1201-jdbc4"]
                 [listora/uuid "0.1.2"]
                 [ch.qos.logback/logback-classic "1.1.7" :exclusions [org.slf4j/slf4j-api]]
                 [org.slf4j/jul-to-slf4j "1.7.21"]
                 [org.slf4j/jcl-over-slf4j "1.7.21"]
                 [org.slf4j/log4j-over-slf4j "1.7.21"]
                 [pedestal-api "0.3.1-SNAPSHOT" :exclusions [prismatic/schema]]
                 [prismatic/schema "1.1.3"]
                 [com.stuartsierra/component "0.3.1"]
                 [clojurewerkz/machine_head "1.0.0-beta9"]
                 [com.boundlessgeo.spatialconnect/schema "0.7"]
                 [buddy "1.1.0"]]

  :repositories {"project" "file:repo"}
  :def-dependencies [[lein-reload "1.0.0"]]

  :plugins [[lein-environ "1.0.3"]
            [ragtime/ragtime.lein "0.3.6"]]

  :aliases {"migrate" ["run" "-m" "spacon.db.conn/migrate"]
            "rollback" ["run" "-m" "spacon.db.conn/rollback"]}

  :min-lein-version "2.0.0"
  :resource-paths ["config", "resources"]
  ;; If you use HTTP/2 or ALPN, use the java-agent to pull in the correct alpn-boot dependency
  ;:java-agents [[org.mortbay.jetty.alpn/jetty-alpn-agent "2.0.3"]]
  :profiles {:dev {:aliases {"run-dev" ["trampoline" "run" "-m" "spacon.server/run-dev"]}
                   :dependencies [[io.pedestal/pedestal.service-tools "0.5.1"]]}
             :uberjar {:aot [spacon.server]}}
  :main ^{:skip-aot true} spacon.server)

