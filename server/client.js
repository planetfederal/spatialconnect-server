'use strict';

var mqtt = require('mqtt');
var Rx = require('rx');
var SCMessage = require('./SCMessage');
var _ = require('lodash');
var AuthCommands = require('./commands/authenticate');

module.exports = (host, port, username, password, cb) => {
  if (!host || !port) {
    throw new Error('Host and Port must be set for MQTT Connection');
  } else {
    console.log('Starting Client:'+host+' on '+port);
  }
  if (!username || !password) {
    throw new Error('Username and password needed to authenticate to MQTT broker');
  }

  AuthCommands.authenticate(username, password)
    .subscribe(
      (res) => {
        if (res.token) {
          var returnObject = {};

          var client = mqtt.connect('mqtt://'+host+':'+port, {
            clientId : 'spatialconnect_server',
            username: res.token,
            password: 'anypass'
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

          cb(returnObject);
        }
      },
      (err) => {
        console.log('Could not authenticate to MQTT broker!', err);
      }
    );
};
