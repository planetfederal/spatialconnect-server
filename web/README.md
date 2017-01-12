## spatialconnect-server-dashboard


The SpatialConnect Dashboard is a web application that allows users to configure
events, data stores, notifications, users, and other properties of
the spatialconnect-server.


### to run for local development

```
npm run start:local
```

### testing

To run the tests

```
npm test
```


### to build the nginx container for the environment

```
docker build -t boundlessgeo/spatialconnect-server:web-dev -f Dockerfile.dev .
```
