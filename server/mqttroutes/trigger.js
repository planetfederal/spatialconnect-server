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
      triggers = _.keyBy(d,'id');
    }
  );

  let upsertTrigger = tn => {
    triggers[tn.id] = tn;
  };

  let removeTrigger = tn => {
    triggers = _.omit(triggers,tn.id);
  };

  let checkGeoFence = pt => {
    _.map(_.filter(triggers, 'definition'),t => {
      var isIn = inside(pt,t.definition);

      if (isIn) {
        var n = Notification();
        n.title('Geofence').body('Point is in Polygon').alert();
        if (t.recipients !== undefined && t.recipients.length > 0) {
          n.to(t.recipients);
        }
        dispatcher.publish(NotifyCommands.CHANNEL_NOTIFY_INFO,n);
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
