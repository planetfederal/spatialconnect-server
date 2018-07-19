# spatialconnect-server

This server is the interface used to communicate with mobile clients
using the SpatialConnect libraries. It's also the API that powers the
dashboard web application.

## Version

0.10

## Prerequisites

First you have to install [Docker](https://docs.docker.com/engine/installation/) for your local workstation.

Since spatialconnect-server is written in Clojure, you will need to install
[Leiningen](https://leiningen.org/#install)

> On MacOS, run `brew install leiningen`

### Local development environment setup

First startup the database container:

```
docker-compose up -d postgis
```

Then create the database, database user, and schema. (You may need to wait a few seconds for the db container to fully start)

```
docker-compose run -e PGHOST=postgis -e PGUSER=postgres --rm postgis createuser spacon
docker-compose run -e PGHOST=postgis -e PGUSER=postgres --rm postgis createdb spacon -O spacon
docker-compose run -e PGHOST=postgis -e PGUSER=spacon --rm postgis psql -d spacon -c "CREATE SCHEMA spacon;"
docker-compose run -e PGHOST=postgis -e PGUSER=spacon --rm postgis psql -d spacon -c "ALTER ROLE spacon SET search_path = spacon,public;"
```

Then add the required extensions to our database.

```
docker-compose run -e PGHOST=postgis -e PGUSER=postgres --rm postgis psql -d spacon -c "CREATE EXTENSION postgis;"
docker-compose run -e PGHOST=postgis -e PGUSER=postgres --rm postgis psql -d spacon -c "CREATE EXTENSION pgcrypto;"
```

Now run the migration.

```
cd server/
lein migrate
```

Assuming you're still in the `server` dir, you can build the uberjar to put in the container with `lein uberjar`.

Start the spatialconnect-server container (which also starts the mosquitto container)

```
cd ..
docker-compose up -d --build spatialconnect-server
# you can tail the logs to ensure everything worked as expected
docker-compose logs -f spatialconnect-server
```

To run the webapp for local development,

```
cd /path/to/spatialconnect-server/web
npm install
npm run start:local
```

The webpack-dev-server will host the app here http://localhost:8080 and rebuild
the JS when you make changes.

When you're done, you can shut all the containers down with

```
docker-compose stop
```

And if you want to remove all the containers, you can run

```
docker-compose rm -vf
```

To test the TLS configuration, you can use the `mosquitto_pub` command line
client. Make sure you obtain a valid token by authenticating to the
spatialconnect-server container api first. Also note that the password is
required even though it is not used.

```
mosquitto_pub -h <container hostname or ip> -p 8883 -t "test" -m "sample pub"  -u "valid jwt" -P "anypass" --cafile path/to/ca.crt --insecure -d
```

### Building the spatialconnect-server container

You can build the spatialconnect-server Docker container like this

```
cd server/
lein uberjar
docker build -t boundlessgeo/spatialconnect-server .
```

If you need to deploy to a Cloud Foundry environment, you can deploy
the container like this:

```
# build the container for the environment
docker build -t boundlessgeo/spatialconnect-server:devio .
# push to a container repo where PCF can access it
docker push boundlessgeo/spatialconnect-server:devio
# instruct pcf to deploy the app using the container
cf push efc -o boundlessgeo/spatialconnect-server:devio
```
