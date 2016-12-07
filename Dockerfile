FROM java:8-alpine
MAINTAINER Marc Cenac <mcenac@boundlessgeo.com>

RUN mkdir /opt
ADD server/target/spacon-server.jar /opt/spacon-server.jar

EXPOSE 8085

CMD ["java", "-jar", "/opt/spacon-server.jar"]
