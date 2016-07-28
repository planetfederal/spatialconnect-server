'use strict';

var mqtt = require('mqtt');
var Rx = require('rx');

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
      sub.onNext({topic:t,message:m});
    });
  }).share();

  returnObject.listenOnTopic = (topic) => {
    client.subscribe(topic);
    console.log('Subscribed on:'+topic);
    return messages.filter((d) => d.topic === topic);
  };

  returnObject.publish = (topic,message) => {
    client.publish(topic,message);
  };

  returnObject.end = () => {
    client.end();
  };

  return returnObject;
};
