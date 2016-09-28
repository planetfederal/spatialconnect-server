'use strict';

var TrackingCommands = require('./../commands/tracking');
var TriggerCommands = require('./../commands/trigger');
var NotifyCommands = require('./../commands/notify');
var inside = require('turf-inside');
var Notification = require('./../notification');
var _ = require('lodash');

module.exports = (mqttClient,dispatcher) => {
  let triggers = undefined;

  TriggerCommands.triggers().subscribe(
    d => {
      console.log(d);
      triggers = _.keyBy(d,'id');
      console.log(triggers);
    }
  );

  let upsertTrigger = tn => {
    console.log('previousState');
    console.log(triggers);
    triggers[tn.id] = tn;
    console.log('upsertedState');
    console.log(triggers);
  };

  let removeTrigger = tId => {
    console.log('previousState');
    console.log(triggers);
    triggers = _.omit(triggers,tId);
    console.log('usertedState');
    console.log(triggers);
  };

  let checkGeoFence = pt => {
    _.map(_.filter(triggers, 'definition'),(t,k) => {
      console.log('Checking '+k+' against '+pt.id);
      var isIn = inside(pt,t.definition);

      if (isIn) {
        console.log('Is In ' + k);
        var n = Notification();
        n.title('Geofence').body('Point is in Polygon').alert();
        if (t.recipients !== undefined && t.recipients.length > 0) {
          n.to(t.recipients);
        }
        dispatcher.publish(NotifyCommands.CHANNEL_NOTIFY_INFO,n);
      } else {
        console.log('Not in '+ k);
      }
    });
  };

  let setupListeners = () => {
    dispatcher.subscribe(TrackingCommands.CHANNEL_TRACKING_UPDATE,checkGeoFence);
    dispatcher.subscribe(TriggerCommands.CHANNEL_TRIGGER_CREATE,upsertTrigger);
    dispatcher.subscribe(TriggerCommands.CHANNEL_TRIGGER_UPDATE,upsertTrigger);
    dispatcher.subscribe(TriggerCommands.CHANNEL_TRIGGER_REMOVE,removeTrigger);
  };

  return {
    name : 'trigger',
    setupListeners : setupListeners
  };
};
