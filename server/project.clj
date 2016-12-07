(defproject spacon "0.7.1-SNAPSHOT"
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
                 [cljfmt "0.5.1"]
                 [org.postgresql/postgresql "9.4-1201-jdbc4"]
                 [clojure.jdbc/clojure.jdbc-c3p0 "0.3.1"]
                 [listora/uuid "0.1.2"]
                 [ch.qos.logback/logback-classic "1.1.7" :exclusions [org.slf4j/slf4j-api]]
                 [org.slf4j/jul-to-slf4j "1.7.21"]
                 [org.slf4j/jcl-over-slf4j "1.7.21"]
                 [org.slf4j/log4j-over-slf4j "1.7.21"]
                 [com.stuartsierra/component "0.3.1"]
                 [clojurewerkz/machine_head "1.0.0-beta9"]
                 [com.boundlessgeo.spatialconnect/schema "0.7"]
                 [buddy "1.1.0"]
                 [camel-snake-kebab "0.4.0"]
                 [org.clojars.diogok/cljts "0.5.0"]
                 [org.clojure/tools.nrepl "0.2.12"]
                 [jonase/eastwood "0.2.3" :exclusions [org.clojure/clojure]]]

  :repositories  [["osgeo" "http://download.osgeo.org/webdav/geotools/"]
                  ["clojars" {:sign-releases false}]
                  ["project" "file:repo"]]
  :dev-dependencies [[lein-reload "1.0.0"]]

  :plugins [[lein-environ "1.0.3"]
            [ragtime/ragtime.lein "0.3.6"]
            [jonase/eastwood "0.2.3"]]

  :aliases {"migrate" ["run" "-m" "spacon.db.conn/migrate"]
            "rollback" ["run" "-m" "spacon.db.conn/rollback"]}

  :monkeypatch-clojure-test false
  :min-lein-version "2.0.0"
  :resource-paths ["config", "resources"]
  ;; If you use HTTP/2 or ALPN, use the java-agent to pull in the correct alpn-boot dependency
  ;:java-agents [[org.mortbay.jetty.alpn/jetty-alpn-agent "2.0.3"]]
  :profiles {:dev {:source-paths ["dev"]
                   :dependencies [[io.pedestal/pedestal.service-tools "0.5.1"]
                                  [org.clojure/test.check "0.9.0"]]}
             :uberjar {:aot :all}}
  :uberjar-name "spacon-server.jar"
  :main ^{:skip-aot true} spacon.server)
