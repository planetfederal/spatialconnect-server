FROM clojure:alpine
MAINTAINER Marc Cenac <mcenac@boundlessgeo.com>
COPY ./target/spacon-server.jar /
# COPY ./tls/ /opt/server/tls
EXPOSE 8085
CMD ["java", "-jar", "/spacon-server.jar"]
