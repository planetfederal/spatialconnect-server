'use strict';

var fs        = require('fs');
var path      = require('path');
var mqttClient = require('./../client')('localhost',1883);

var strategy = {};

fs.readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js');
  })
  .forEach(function(file) {
    var s = require(path.join(__dirname,file))(mqttClient);
    strategy[s.name] = s;
  });

module.exports = strategy;
