# spatialconnect-server

This server is the interface used to communicate with mobile clients
using the SpatialConnect libraries.  It's also the API that powers the
dashboard web application.


## Running with Docker

First you have to install [Docker](https://docs.docker.com/engine/installation/) for your local workstation.

#### On OS X

If you are developing on OS X, make sure that your Docker host vm is started `docker-machine ls` and that your shell is configured to use it `eval $(docker-machine env default)`.

Additionally, to enable a more pleasant experience, you'll need to install [docker-osx-dev](https://github.com/brikis98/docker-osx-dev) so you don't have to rebuild the container every time you change a file.

```
curl -o /usr/local/bin/docker-osx-dev https://raw.githubusercontent.com/brikis98/docker-osx-dev/master/src/docker-osx-dev
chmod +x /usr/local/bin/docker-osx-dev
docker-osx-dev install
```

After installing, you need to run `docker-osx-dev` in one terminal and do your work in another.

Also, since you're syncing the files from your local workstation, you should run `npm install` from the root directory of this project and in the web directory to install the dependencies locally.


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
create extension bottledwater;
```

Now in another terminal, start the bottledwater client by running

```
docker-compose up -d bottledwater
```


To start the spatialconnect container, run

```
docker-compose up -d spatialconnect
```

To see all the changes to the event table, run the kafka console consumer for the `event` topic

```
docker-compose run --rm consumer --from-beginning --topic event
```

### Testing the API and dashboard

You can explore the API by using the explorer at http://default/explorer/

The web app dashboard is at the root http://default

> The hostname "default" should be setup in your /etc/hosts from docker-osx-dev,
> but if not you can find the IP address with `docker-machine ip default` and
> add the entry yourself


When you're done, don't forget to shut it down with

```
docker-compose stop
```

And if you want to remove all the containers, you can run

```
docker-compose rm -vf
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
