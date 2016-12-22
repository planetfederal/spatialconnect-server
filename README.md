# spatialconnect-server

This server is the interface used to communicate with mobile clients
using the SpatialConnect libraries.  It's also the API that powers the
dashboard web application.

## Version
0.7

## Running with Docker

First you have to install [Docker](https://docs.docker.com/engine/installation/) for your local workstation.

### Building the spatialconnect-server container

You can build the spatialconnect-server Docker container like this

```
docker build -t boundlessgeo/spatialconnect-server .
```

Once you've built the container, you can push it to the Docker registry to
trigger a redeployment:

```
docker push boundlessgeo/spatialconnect-server
```

> Note that anytime the boundlessgeo/spatialconnect-server GitHub repo is
> updated, the container will be rebuilt and deployed to the appropriate
> environment.

### Local development environment setup

First startup the database container:

```
docker-compose up -d postgis
```

Then create the database and database user.  (You may need to wait a few seconds for the db container to fully start)

```
docker-compose run -e PGHOST=postgis -e PGUSER=postgres --rm postgis createuser spacon
docker-compose run -e PGHOST=postgis -e PGUSER=postgres --rm postgis createdb spacon -O spacon
```

Then add the required extensions to our database.

```
docker-compose run -e PGHOST=postgis -e PGUSER=postgres --rm postgis psql -d spacon -c "CREATE EXTENSION postgis;"
docker-compose run -e PGHOST=postgis -e PGUSER=postgres --rm postgis psql -d spacon -c "CREATE EXTENSION pgcrypto;"
```

Now run the migration.

> You will need to install [leiningen](http://leiningen.org/) to run the migration, if you haven't installed it yet.  On OSX, run `brew install leiningen`.

```
cd server/
lein migrate
```

Build the latest version of the spatialconnect-server container.

```
# assuming you're still in the server directory, build the uberjar
lein uberjar

# now build the container to run the uberjar
cd /path/to/spatialconnect-server/
docker-compose build spatialconnect-server
```

Start the spatialconnect-server container (which also starts the mosquitto container)

```
docker-compose up -d spatialconnect-server
# you can tail the logs to ensure everything worked as expected
docker-compose logs -f spatialconnect-server
```


To run the webapp for local development,

```
cd /path/to/spatialconnect-server/web
npm install
npm run start:local
```

When you're done, you can shut all the containers down with

```
docker-compose stop
```

And if you want to remove all the containers, you can run

```
docker-compose rm -vf
```


To test the TLS configuration, you can use the `mosquitto_pub` command line
client.  Make sure you obtain a valid token by authenticating to the
spatialconnect-server container api first.  Also note that the password is
required even though it is not used.
```
mosquitto_pub -h <container hostname or ip> -p 8883 -t "test" -m "sample pub"  -u "valid jwt" -P "anypass" --cafile path/to/ca.crt --insecure -d
```
