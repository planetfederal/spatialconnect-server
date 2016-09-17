'use strict';

var FormCommands = require('./../commands/form');

module.exports = (mqttClient,dispatcher) => {
  let form$ = mqttClient.listenOnTopic('/store/form');

  let message = form$.filter((d) => d.replyTo === '');

  message.subscribe(
    d => {
      let data = JSON.parse(d.payload);
      FormCommands.formSubmit(data.form_id,data.feature)
        .subscribe(
          dispatcher.publish(FormCommands.CHANNEL_FORM_CREATE,d.payload)
        );
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
