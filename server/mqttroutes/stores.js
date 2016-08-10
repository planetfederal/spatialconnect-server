'use strict';

var StoreCommands = require('./../commands/store');

module.exports = (mqttClient,dispatcher) => {
  let listenOnTopic = (topic) => {
    mqttClient.listenOnTopic(topic)
      .subscribe(
        (d) => console.log('Message From ' + topic + ':' + d.message.toString()),
        (err) => console.log(err)
      );
  };

  StoreCommands.stores()
    .subscribe(
      (store) => {
        listenOnTopic('/store/'+store.id);
      }
    );

  let setupListeners = function() {
    dispatcher.subscribe(StoreCommands.CHANNEL_STORE_CREATE,d => {
      mqttClient.listenOnTopic('/store/'+d.id);
    });
  };

  return {
    name : 'STORES',
    setupListeners
  };
};
