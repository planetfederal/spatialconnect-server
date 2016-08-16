'use strict';

var express = require('express');
let router = express.Router();
var FormCommand = require('./../commands/form');

router.get('/', (req, res) => {
  FormCommand.forms().subscribe(
    f => res.json(f)
  );
});

router.get('/:form_key', (req, res) => {
  FormCommand.form(req.params.form_key)
    .subscribe(
      d => res.json(d)
    );
});

router.get('/:formId/results', (req, res) => {
  FormCommand.formResults(req.params.formId)
    .subscribe(d => res.json(d));
});

router.post('/:formId/submit', (req, res) => {
  let id = req.params.formId;
  let val = req.body;
  FormCommand.formSubmit(id,val)
    .subscribe(
      d => res.json(d)
    );
});

router.post('/', (req, res) => {
  let fields = req.body.fields;
  let form = req.body.form;
  FormCommand.createForm(fields,form)
    .subscribe(
      d => res.json(d),
      err => res.status(500).send({
        success:false,
        message:err
      })
  );
});

router.delete('/:form_key', (req, res) => {
  let key = req.params.form_key;
  FormCommand.deleteForm(key)
    .subscribe(d => res.json(d));
});

module.exports = router;
