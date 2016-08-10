'use strict';

module.exports = (function(){
  let dispatcher = {
    channels : {}
  };
  let subscribe = (channel, fn) => {
    if (dispatcher.channels === undefined || !dispatcher.channels[channel]) {
      dispatcher.channels[channel] = [];
    }
    dispatcher.channels[channel].push({ context: this, callback: fn });
  };

  let publish = function(channel) {
    if (!dispatcher.channels[channel]) {
      return false;
    }
    var args = Array.prototype.slice.call(arguments, 1);
    for (var i = 0, l = dispatcher.channels[channel].length; i < l; i++) {
      var subscription = dispatcher.channels[channel][i];
      subscription.callback.apply(subscription.context, args);
    }
  };

  return {
    publish,
    subscribe
  };
})();
