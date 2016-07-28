'use strict';

var SCMessage = require('./../SCMessage');

module.exports = (mqttClient) => {
  let form$ = mqttClient.listenOnTopic('/ping')
    .map((d) => {
      console.log('Decode');
      return SCMessage.decode(d.message);
    });

  let reply = form$.filter((d) => d.replyTo !== '');
  let message = form$.filter((d) => d.replyTo === '');

  reply.subscribe(
    (d) => {
      console.log('ReplyToChannel');
      console.log(d);
      mqttClient.publish(d.replyTo,d.toBuffer());
      console.log('Sent to:'+d.replyTo);
    }
  );

  message.subscribe(
    (d) => {
      console.log('IncomingChannel');
      console.log(d);
    },
    (err) => console.log(err)
  );

  return {
    name : 'form'
  };
};
