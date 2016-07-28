'use strict';

var models = require('./../models/');
var SCMessage = require('./../SCMessage');

module.exports = (mqttClient) => {
  let form$ = mqttClient.listenOnTopic('/store/form')
    .map((d) => {
      return SCMessage.decode(d.message);
    });

  let reply = form$.filter((d) => d.replyTo !== '');
  let message = form$.filter((d) => d.replyTo === '');

  reply.subscribe(
    (d) => {
      mqttClient.publish(d.replyTo,'Replied To');
    }
  );

  message.subscribe(
    (d) => {
      console.log(d);
    },
    (err) => console.log(err)
  );

  return {
    name : 'form'
  };
};
