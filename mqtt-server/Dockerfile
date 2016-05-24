FROM java:7
MAINTAINER BoundlessGeo <spacon@boundlessgeo.com>

ADD target/mqtt-server-0.1.0-SNAPSHOT-standalone.jar /srv/mqtt-server.jar

EXPOSE 8085

CMD ["java", "-jar", "/srv/mqtt-server.jar"]
