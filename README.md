# spatialconnect-server

This server is the interface used to communicate with mobile clients
using the SpatialConnect libraries.  It's also the API that powers the
dashboard web application.


## Running with Docker

First you have to install [Docker](https://docs.docker.com/engine/installation/) for your local workstation.

#### On OS X

If you are developing on OS X, make sure that your Docker host vm is started `docker-machine ls` and that your shell is configured to use it `eval $(docker-machine env)`.


### Running all the images

To setup all of the spatialconnect infrastructure for the first time, use docker-compose to
setup the dependent services.

```
docker-compose up -d zookeeper kafka schema-registry postgres
```

Then add the bottled water extension to the postgres database.  First
open a `psql` terminal on the postgres image

```
docker-compose run -e PGHOST=postgres -e PGUSER=postgres --rm postgres psql
```

then add the extension

```
CREATE EXTENSION bottledwater;
```

Now in another terminal, start the bottledwater client by running

```
docker-compose up -d bottledwater
```

Then create the database and database user:

```
docker-compose run -e PGHOST=postgres -e PGUSER=postgres --rm postgres createuser spacon
docker-compose run -e PGHOST=postgres -e PGUSER=postgres --rm postgres createdb spacon -O spacon
```

Start the spatialconnect-server container

```
docker-compose up -d spatialconnect-server
```

> If this is the initial setup, you'll also need to run the migration with `docker-compose run --rm spatialconnect-server node_modules/db-migrate/bin/db-migrate up --env=production`


To see all the changes to the `stores` table, run the kafka console consumer for the `stores` topic

```
docker-compose run --rm consumer --from-beginning --topic stores
```

When you're done, don't forget to shut it down with

```
docker-compose stop
```

And if you want to remove all the containers, you can run

```
docker-compose rm -vf
```
