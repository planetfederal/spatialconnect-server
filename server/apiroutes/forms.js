'use strict';

var express = require('express');
let router = express.Router();
var FormCommand = require('./../commands/form');
var response = require('./../httpresponse');
var dispatcher = require('./../dispatcher');

router.get('/', (req, res) => {
  FormCommand.forms().subscribe(
    f => response.success(res,f)
  );
});

router.get('/:form_key', (req, res) => {
  FormCommand.form(req.params.form_key)
    .subscribe(
      d => response.success(res,d)
    );
});

router.get('/:formId/results', (req, res) => {
  FormCommand.formResults(req.params.formId)
    .subscribe(d => response.success(res,d));
});

router.post('/:formId/submit', (req, res) => {
  let id = req.params.formId;
  let val = req.body;
  FormCommand.formSubmit(id,val)
    .subscribe(
      d => response.success(res,d)
    );
});

router.post('/', (req, res) => {
  let form = req.body;
  FormCommand.createForm(form)
    .subscribe(
      d => {
        response.success(res,d);
        dispatcher.publish(FormCommand.CHANNEL_FORM_CREATE,d);
      },
      err => response.internalError(res,err)
  );
});

router.delete('/:form_key', (req, res) => {
  let key = req.params.form_key;
  FormCommand.deleteForm(key)
    .subscribe(
      d => {
        response.success(res,d);
        dispatcher.publish(FormCommand.CHANNEL_FORM_DELETE,key);
      },
      err => response.internalError(res,err)
    );
});

module.exports = router;
