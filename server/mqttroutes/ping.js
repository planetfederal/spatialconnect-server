'use strict';

var SCMessage = require('./../SCMessage');

module.exports = (mqttClient) => {
  let form$ = mqttClient.listenOnTopic('/ping')
    .map((d) => {
      return SCMessage.decode(d.message);
    });

  let reply = form$.filter((d) => d.replyTo !== '');
  let message = form$.filter((d) => d.replyTo === '');

  reply.subscribe(
    (d) => {
      mqttClient.publish(d.replyTo,d.toBuffer());
    }
  );

  message.subscribe(
    (d) => {
      console.log('IncomingChannel');
      console.log(d);
    },
    (err) => console.log(err)
  );

  let setupListeners = () => {

  };

  return {
    name : 'form',
    setupListeners
  };
};
