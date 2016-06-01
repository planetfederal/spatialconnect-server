# mqtt-server

## Usage

```
sh setup/up.sh
lein migrate
lein run -m mqtt-server.core
```
or you can run with java
```
lein uberjar
java -jar target/mqtt-server-0.1.0-SNAPSHOT-standalone.jar
```

## License

Copyright © 2016 Boundless Geo

Distributed under the Apache 2.0 Library
