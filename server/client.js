'use strict';

var mqtt = require('mqtt');
var Rx = require('rx');
var SCMessage = require('./SCMessage');
var _ = require('lodash');

module.exports = (host,port) => {
  if (!host || !port) {
    throw new Error('Host and Port must be set for MQTT Connection');
  } else {
    console.log('Starting Client:'+host+' on '+port);
  }

  var returnObject = {};

  var client = mqtt.connect('mqtt://'+host+':'+port,{
    clientId : 'spatialconnect_server'
  });

  client.on('connect',() => {
    console.log('Client Connected');
  });

  client.on('error',(err) => {
    console.log('Client Error:'+err);
  });

  var messages = Rx.Observable.create((sub) => {
    client.on('message',(t,m) => {
      sub.onNext({topic:t,message:SCMessage.decode(m)});
    });
  }).share();

  returnObject.listenOnTopic = (topic) => {
    client.subscribe(topic);
    console.log('Subscribed on:'+topic);
    return messages.filter((d) => d.topic === topic);
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

  returnObject.publish = (topic,message) => {
    client.publish(topic,message);
  };

  returnObject.end = () => {
    client.end();
  };

  return returnObject;
};
