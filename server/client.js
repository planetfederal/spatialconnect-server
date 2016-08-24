'use strict';

var mqtt = require('mqtt');
var Rx = require('rx');
var SCMessage = require('./SCMessage');
var _ = require('lodash');

module.exports = (host,port,clientId = 'spatialconnect_server') => {
  if (!host || !port) {
    throw new Error('Host and Port must be set for MQTT Connection');
  } else {
    console.log('Starting Client:'+host+' on '+port);
  }

  var returnObject = {};

  var client = mqtt.connect('mqtt://'+host+':'+port,{
    clientId : clientId
  });

  client.on('connect',() => {
    console.log('Client Connected');
  });

  client.on('error',(err) => {
    console.log('Client Error:'+err);
  });

  var messages = Rx.Observable.create((sub) => {
    client.on('message',(t,m) => {
      const mm = SCMessage.decode(m);
      sub.onNext({topic:t,message:mm});
    });
  }).share();

  returnObject.listenOnTopic = (topic) => {
    client.subscribe(topic);
    return messages.filter((d) => d.topic === topic).map(m => m.message);
  };

  returnObject.publishObj = (topic,obj) => {
    var newObj = _.defaults(obj,{
      correlationId : -1,
      replyTo : '',
      action : -1,
      payload : ''
    });
    client.publish(topic,SCMessage.encode(newObj).toBuffer());
  };

  returnObject.end = () => {
    client.end();
  };

  return returnObject;
};
