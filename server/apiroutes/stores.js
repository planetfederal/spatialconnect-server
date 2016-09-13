'use strict';

let express = require('express');
let router  = express.Router();
let StoreCommands = require('./../commands/store');
let response = require('./../httpresponse');

module.exports = dispatcher => {

  router.get('/', (req, res) => {
    StoreCommands.stores()
      .subscribe(d => response.success(res,d));
  });

  router.get('/:storeId', (req, res) => {
    StoreCommands.store(req.params.storeId)
      .subscribe(d => response.success(res,d));
  });

  router.post('/', (req, res) => {
    let store = req.body;
    StoreCommands.createStore(store)
      .subscribe(d => {
        response.success(res,d);
        dispatcher.publish(StoreCommands.CHANNEL_STORE_CREATE,d);
      });
  });

  router.put('/:storeId', (req, res) => {
    let id = req.params.storeId;
    let store = req.body;
    StoreCommands.updateStore(id,store)
      .subscribe(d => response.success(res,d));
  });

  router.delete('/:storeId', (req, res) => {
    let id = req.params.storeId;
    StoreCommands.deleteStore(id)
      .subscribe(d => response.success(res,d));
  });

  return router;
};
