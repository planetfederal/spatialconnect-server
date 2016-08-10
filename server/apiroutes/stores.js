'use strict';

let express = require('express');
let router  = express.Router();
let StoreCommands = require('./../commands/store');

module.exports = dispatcher => {

  router.get('/', (req, res) => {
    StoreCommands.stores()
      .subscribe(d => res.json(d));
  });

  router.get('/:storeId', (req, res) => {
    StoreCommands.store(req.params.storeId)
      .subscribe(d => res.json(d));
  });

  router.post('/', (req, res) => {
    let store = req.body;
    StoreCommands.createStore(store)
      .subscribe(d => {
        res.json(d);
        dispatcher.publish(StoreCommands.CHANNEL_STORE_CREATE,d);
      });
  });

  router.put('/:storeId', (req, res) => {
    let id = req.params.storeId;
    let store = req.body;
    StoreCommands.updateStore(id,store)
      .subscribe(d => res.json(d));
  });

  router.delete('/:storeId', (req, res) => {
    let id = req.params.storeId;
    StoreCommands.deleteStore(id)
      .subscribe(d => res.json(d));
  });

  return router;
};
