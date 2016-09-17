'use strict';

var models = require('./../models/');
var StoreCommands = require('./../commands/store');
var FormCommands = require('./../commands/form');
var ConfigCommands = require('./../commands/config');
var SCCommands = require('../../schema/actions');

module.exports = (mqttClient,dispatcher) => {
  mqttClient.listenOnTopic('/config')
    .subscribe(
      (d) => {
        ConfigCommands.full().take(1).subscribe(
          cfg => {
            mqttClient.publishObj(d.replyTo,{
              correlationId:d.correlationId,
              payload:JSON.stringify(cfg)
            });
          }
        );
      },
      (err) => console.log(err)
    );

  mqttClient.listenOnTopic('/config/register')
    .subscribe(
      (d) => {
        models.Devices.register(models,JSON.parse(d.payload));
      }
    );

  let storeAdded = store => {
    let obj = {
      action:SCCommands.CONFIG_ADD_STORE,
      payload:JSON.stringify(store)
    };
    mqttClient.publishObj('/config/update',obj);
  };

  let storeUpdated = store => {
    let obj = {
      action:SCCommands.CONFIG_UPDATE_STORE,
      payload:JSON.stringify(store)
    };
    mqttClient.publishObj('/config/update',obj);
  };

  let storeDeleted = storeId => {
    let obj = {
      action:SCCommands.CONFIG_REMOVE_STORE,
      payload:storeId
    };
    mqttClient.publishObj('/config/update',obj);
  };

  let formAdded = form => {
    let obj = {payload:JSON.stringify(form)};
    obj.action = SCCommands.CONFIG_ADD_FORM;
    mqttClient.publishObj('/config/update',obj);
  };

  let formUpdated = form => {
    let obj = {payload:JSON.stringify(form)};
    obj.action = SCCommands.CONFIG_UPDATE_FORM;
    mqttClient.publishObj('/config/update',obj);
  };

  let formRemoved = formKey => {
    let obj = {payload:formKey};
    obj.action = SCCommands.CONFIG_REMOVE_FORM;
    mqttClient.publishObj('/config/update',obj);
  };

  let setupListeners = function() {
    dispatcher.subscribe(StoreCommands.CHANNEL_STORE_CREATE, storeAdded);
    dispatcher.subscribe(StoreCommands.CHANNEL_STORE_UPDATE, storeUpdated);
    dispatcher.subscribe(StoreCommands.CHANNEL_STORE_DELETE, storeDeleted);
    dispatcher.subscribe(FormCommands.CHANNEL_FORM_CREATE, formAdded);
    dispatcher.subscribe(FormCommands.CHANNEL_FORM_UPDATE, formUpdated);
    dispatcher.subscribe(FormCommands.CHANNEL_FORM_DELETE, formRemoved);
  };

  return {
    name : 'config',
    setupListeners : setupListeners
  };
};
