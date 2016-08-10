# spatialconnect-server

This server is the interface used to communicate with mobile clients
using the SpatialConnect libraries.  It's also the API that powers the
dashboard web application.

## Version
0.5

## Running with Docker

First you have to install [Docker](https://docs.docker.com/engine/installation/) for your local workstation.

#### On OS X

If you are developing on OS X, make sure that your Docker host vm is started `docker-machine ls` and that your shell is configured to use it `eval $(docker-machine env)`.


### Running all the images for local development

To setup all of the spatialconnect infrastructure for the first time, use docker-compose to
setup the dependent services.

```
docker-compose up -d zookeeper kafka postgres
```

Then create the database and database user:

```
docker-compose run -e PGHOST=postgres -e PGUSER=postgres --rm postgres createuser spacon
docker-compose run -e PGHOST=postgres -e PGUSER=postgres --rm postgres createdb spacon -O spacon
```

Then add the bottledwater extension to the postgres server.

```
docker-compose run -e PGHOST=postgres -e PGUSER=spacon --rm postgres psql -U postgres -d spacon -c "CREATE EXTENSION bottledwater;"
```

Start the spatialconnect-server container

```
docker-compose up -d spatialconnect-server
```

> If this is the initial setup, you'll also need to run the migration with `docker-compose run --rm spatialconnect-server node_modules/db-migrate/bin/db-migrate up --env=development`


You may also want to run the spatialconnect-server locally when developing
instead of in the container.  This will allow you to have the hot reloading
without having to rebuild the container each time or deal with syncing the
container filesystem with your workstation.  

You can still use the postgres container as the
database even when running the code outside of the container but you have to
setup a few things first:
```
# build the js bundle using NODE_ENV=container so it gets the correct API_URL
cd web/
NODE_ENV=container webpack
# run the server with NODE_ENV=container so it connects to the container db
cd ../server/
NODE_ENV=container npm start
```

Start the bottledwater client by running

```
docker-compose up -d bottledwater
```

To see all the topics that were created by the bottledwater client
```
docker-compose run --rm kafka-tools kafka-topics --zookeeper zookeeper --list
```

To see messages published to a topic, run the kafka console consumer for the
topic you're interested in.  Below we look at the `stores` topic:
```
docker-compose run --rm kafka-tools kafka-console-consumer --zookeeper zookeeper --topic stores --from-beginning
```

To see the dashboard, you'll need to add an entry to your `/etc/hosts` file mapping
the IP of your docker machine to the virtual host like so:
```
192.168.99.100 spatialconnect-server
```

Then you can visit http://spatialconnect-server to see everything running on
your docker machine.


To run the connectors,

```
dc up -d spatialconnect-connectors
```

When you're done, don't forget to shut it down with

```
docker-compose stop
```

And if you want to remove all the containers, you can run

```
docker-compose rm -vf
```
