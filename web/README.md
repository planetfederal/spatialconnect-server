## spatialconnect-server-dashboard

The SpatialConnect Dashboard is a web application that allows users to configure
events, data stores, notifications, users, and other properties of
the spatialconnect-server.

### testing

To run the tests

```
npm test
```


### build the data volume container for nginx
```
# first build the static assests for the environment
NODE_ENV=development webpack

# then build a data volume container for the environment
docker build -t boundlessgeo/spatialconnect-nginx-config:development -f Dockerfile.nginx-config .
```
