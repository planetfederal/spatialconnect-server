'use strict';

var express = require('express');
let router = express.Router();
var models = require('../models/');
var Rx = require('rx');
var _ = require('lodash');

const tKeys = ['created_at', 'updated_at', 'deleted_at'];

var filterStampsAndNulls = (ff) => {
  return _.chain(ff.dataValues)
    .omit(tKeys)
    .omit('form_id')
    .omitBy(_.isNull)
    .value();
};

var updateFields$ = (formId, fields) => {
  return Rx.Observable.fromArray(fields)
    .map(field => {
      field.form_id = formId;
      field = _.omit(field, 'id');
      return field;
    })
    .flatMap((field) => {
      return Rx.Observable.fromPromise(models.FormFields.create(field));
    });
};

router.get('/', (req, res) => {
  models.Forms.uniqueForms$(models)
    .flatMap(form => models.Forms.formDefinition$(models, form.id))
    .toArray()
    .subscribe(forms => res.json(forms), err => console.log(err));
});

router.get('/:form_key', (req, res) => {
  models.Forms.uniqueForms$(models)
    .filter(form => form.form_key === req.params.form_key)
    .flatMap(form => models.Forms.formDefinition$(models, form.id))
    .subscribe(forms => res.json(forms), err => console.log(err));
});

router.get('/:formId/results', (req, res) => {
  Rx.Observable.fromPromise(models.FormData.findAll({
    where: { form_id: req.params.formId }
  }))
    .flatMap(Rx.Observable.fromArray)
    .map(filterStampsAndNulls)
    .toArray()
    .subscribe(formData => res.json(formData), err => console.log(err));
});

router.post('/:formId/submit', (req, res) => {
  let formData = {
    val: req.body,
    form_id: req.params.formId
  };
  Rx.Observable.fromPromise(models.FormData.create(formData))
    .map(filterStampsAndNulls)
    .subscribe(formData => res.json(formData), err => console.log(err));
});

router.post('/', (req, res) => {
  let fields = req.body.fields;
  let form_id;
  Rx.Observable.fromPromise(models.Forms.create(req.body.form))
    .flatMap((form) => {
      form_id = form.dataValues.id;
      return updateFields$(form.dataValues.id, fields);
    })
    .materialize()
    .filter(x => {
      if (x.kind === 'E') {
        res.status(500).send({success: false, error: x.error});
      }
      return x.kind === 'C';
    })
    .flatMap(() => models.Forms.formDefinition$(models,form_id))
    .subscribe(formData => res.json(formData), err => console.log(err));
});

router.delete('/:form_key', (req, res) => {
  Rx.Observable.fromPromise(models.Forms.findAll({
    where: { form_key: req.params.form_key }
  }))
    .flatMap(Rx.Observable.fromArray)
    .flatMap(ff => {
      return Rx.Observable.fromPromise(models.Forms.destroy({
        where: { id: ff.dataValues.id }
      }));
    })
    .toArray()
    .subscribe(
      () => res.json({success: true}),
      err => res.json({success: false, err: err})
    );
});

module.exports = router;
