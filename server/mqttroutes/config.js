'use strict';

var models = require('./../models/');
var StoreCommands = require('./../commands/store');
var FormCommands = require('./../commands/form');
var ConfigCommands = require('./../commands/config');

module.exports = (mqttClient,dispatcher) => {
  mqttClient.listenOnTopic('/config')
    .subscribe(
      (d) => {
        ConfigCommands.full().take(1).subscribe(
          cfg => {
            d.message.payload = JSON.stringify(cfg);
            mqttClient.publishObj(d.message.replyTo,d.message);
          }
        );
      },
      (err) => console.log(err)
    );

  mqttClient.listenOnTopic('/config/register')
    .subscribe(
      (d) => {
        models.Devices.register(models,JSON.parse(d.message.payload));
      }
    );

  let storeAdded = store => {
    let obj = {payload:store.toString()};
    mqttClient.publishObj('/config/store',obj);
  };

  let setupListeners = function() {
    dispatcher.subscribe(StoreCommands.CHANNEL_STORE_CREATE,storeAdded);
    dispatcher.subscribe(StoreCommands.CHANNEL_STORE_UPDATE,() => console.log('STORE UPDATE'));
    dispatcher.subscribe(StoreCommands.CHANNEL_STORE_DELETE,() => console.log('STORE DELETE'));
    dispatcher.subscribe(FormCommands.CHANNEL_FORM_CREATE, () => console.log('FORM CREATE'));
    dispatcher.subscribe(FormCommands.CHANNEL_FORM_DELETE, () => console.log('FORM DELETE'));
  };

  return {
    name : 'config',
    setupListeners
  };
};
