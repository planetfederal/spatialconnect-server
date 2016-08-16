'use strict';

var path = require('path');
var ProtoBuf = require('protobufjs');
var builder = ProtoBuf.loadProtoFile(path.join(__dirname,'./../schema/SCMessage.proto')),
  SCMessage = builder.build('SCMessage');

module.exports = SCMessage;
