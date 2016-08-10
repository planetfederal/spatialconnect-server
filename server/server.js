'use strict';

var express = require('express');
var app = express();
var mqttroutes = require('./mqttroutes/');
var httproutes = require('./httproutes/');
var apiroutes = require('./apiroutes/');

httproutes(app);
apiroutes(app);
mqttroutes('localhost',1883);

var server = app.listen(8085, function () {
  console.log('SpatialConnect-Server listening on port 8085!');
});

module.exports = server;
