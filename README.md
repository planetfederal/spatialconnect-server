# spatialconnect-server

This server is the interface used to communicate with mobile clients
using the SpatialConnect libraries.  It's also the API that powers the
dashboard web application.

## Running

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
