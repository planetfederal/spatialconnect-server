'use strict';

var express = require('express');
var app = express();
var mqttroutes = require('./mqttroutes/');
var httproutes = require('./httproutes/');
var apiroutes = require('./apiroutes/');

var mqttBrokerHost = process.env.MQTT_BROKER_HOST || 'localhost';
var mqttBrokerPort = process.env.MQTT_BROKER_HOST || 1883;

httproutes(app);
apiroutes(app);
mqttroutes(mqttBrokerHost, mqttBrokerPort);

var server = app.listen(8085, function () {
  console.log('SpatialConnect-Server listening on port 8085!');
});

module.exports = server;
