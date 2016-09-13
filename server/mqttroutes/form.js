'use strict';

var FormCommands = require('./../commands/form');

module.exports = (mqttClient,dispatcher) => {
  let form$ = mqttClient.listenOnTopic('/store/form');

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

  let setupListeners = () => {
    dispatcher.subscribe(FormCommands.CHANNEL_FORM_CREATE,() => {});
  };

  return {
    name : 'form',
    setupListeners
  };
};
