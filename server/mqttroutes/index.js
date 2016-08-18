'use strict';

var fs        = require('fs');
var path      = require('path');
var dispatcher = require('./../dispatcher');
var routes = {};

module.exports = function(host,port) {
  var mqttClient = require('./../client')(host,port);
  fs.readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js');
  })
  .forEach(function(file) {
    var s = require(path.join(__dirname,file))(mqttClient,dispatcher);
    s.setupListeners();
    routes[s.name] = s;
  });
};
