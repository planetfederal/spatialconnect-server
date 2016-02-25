# spatialconnect-server

This server is the interface used to communicate with mobile clients
using the SpatialConnect libraries.  It's also the API that powers the
dashboard web application.


## Running with Docker

First you have to install [Docker](https://docs.docker.com/engine/installation/) for your local workstation.  
If you are developing on OS X, make sure that your Docker host vm is started and that your shell is configured to use it.

### Running the spatialconnect image

You can build a Docker image named `spatialconnect` to deploy to your container by running

```
docker build -t spatialconnect .
# or
docker-compose build spatialconnect
```

To start the service in the container, run

```
docker run -p 3000:3000 -d spatialconnect
```

Then you can access the service through the Docker host with

```
curl -v $(docker-machine ip default):3000/api/configs
```

Also, checkout the Swagger explorer to play with the API.  http://<ip.of.docker.host>:3000/explorer

### Running all the images

To setup all of the spatialconnect infrastructure, use docker-compose to
setup the initial dependencies

```
docker-compose up -d zookeeper kafka schema-registry postgres
```

Then add the bottled water extension to the postgres database.  First
open a `psql` terminal on the postgres image

```
docker-compose run --rm postgres psql
```

then add the extension

```
create extension bottledwater;
```

Now you can start the bottledwater client, run

```
docker-compose up -d bottledwater
```

and then take a look at the logs to see what its doing

```
docker-compose logs bottledwater
```

To start the spatialconnect container, run

```
docker-compose up -d spatialconnect
```

To see all the changes to the configs, run the kafka console consumer for the `config` topic

```
docker-compose run --rm consumer --from-beginning --topic config
```

When you're done, don't forget to shut it down with

```
docker-compose stop
```

## Running node service for development

To start the node service, run

```
npm start
```

### Running the example apps
To run the example apps you first must change to the ExampleProject
directory

```
cd ExampleProject/
```

To start the Android app, first you need to start an emulator.  Then you
can run

```
react-native run-android
```

To run the iOS app, run

```
react-native run-ios
```

### Signing the example apps

First you will need to obtain the signing key file and passwords from one of the project
leaders.  Email spatialconnect@boundlessgeo.com to request it.

#### Signing the Android app

To generate a signed APK, you need to change to the
`ExampleProject/android` directory and run

```
./gradlew assembleRelease
```

Then you can find the distributable app at
`android/app/build/outputs/apk/app-release.apk`.

If you want to install this signed apk to your local device to test, run

```
./gradlew installRelease
```
