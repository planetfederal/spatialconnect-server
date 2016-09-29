'use strict';

var express = require('express');
var app = express();
var mqttroutes = require('./mqttroutes/');
var httproutes = require('./httproutes/');
var apiroutes = require('./apiroutes/');

var mqttBrokerHost = process.env.MQTT_BROKER_HOST || 'localhost';
var mqttBrokerPort = process.env.MQTT_BROKER_PORT || 1883;

var dispatcher = require('./dispatcher');
var TrackingCommands = require('./commands/tracking');

httproutes(app);
apiroutes(app);
mqttroutes(mqttBrokerHost, mqttBrokerPort);

var server = app.listen(8085, function () {
  console.log('SpatialConnect-Server listening on port 8085!');
});

var WebSocketServer = require('ws').Server;
var wss = WebSocketServer({port:8086});

wss.on('connection',ws => {
  let send = t => {
    if (ws.readyState == 1) {
      ws.send(JSON.stringify(t));
    }
  };
  dispatcher.subscribe(TrackingCommands.CHANNEL_TRACKING_UPDATE,send);
});

module.exports = server;
