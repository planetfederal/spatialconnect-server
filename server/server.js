'use strict';

var express    = require('express');
var app        = express();
var httproutes = require('./httproutes/');
var apiroutes  = require('./apiroutes/');
var mqttClient = require('./client');
var fs         = require('fs');
var path       = require('path');
var dispatcher = require('./dispatcher');

var mqttBrokerHost = process.env.MQTT_BROKER_HOST || 'localhost';
var mqttBrokerPort = process.env.MQTT_BROKER_PORT || 1883;
var mqttUsername   = process.env.MQTT_BROKER_USERNAME || 'a';
var mqttPassword   = process.env.MQTT_BROKER_PASSWORD || 'a';

var dispatcher = require('./dispatcher');
var TrackingCommands = require('./commands/tracking');

httproutes(app);
apiroutes(app);

mqttClient(mqttBrokerHost, mqttBrokerPort, mqttUsername, mqttPassword, (client) => {
  var routes = {};
  var routesPath = path.join(__dirname,'mqttroutes');
  fs.readdirSync(routesPath)
  .filter(file => file !== undefined && file.indexOf('.') !== 0)
  .forEach(file => {
    var s = require(path.join(routesPath,file))(client,dispatcher);
    s.setupListeners();
    routes[s.name] = s;
  });
});

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
