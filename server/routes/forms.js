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

var formFields$ = (formId) => {
  return Rx.Observable.fromPromise(
      models.FormFields.findAll({
        where: {
          form_id: formId
        }
      }))
    .flatMap(Rx.Observable.fromArray)
    .map(filterStampsAndNulls)
    .toArray();
};

var updateFields$ = (formId, fields) => {
  return Rx.Observable.fromArray(fields)
    .map(field => {
      field.form_id = formId;
      return field;
    })
    .flatMap((field) => {
      return Rx.Observable.fromPromise(models.FormFields.upsert(field));
    });
};

var deleteFields$ = (fieldIds) => {
  return Rx.Observable.fromArray(fieldIds)
    .flatMap((fieldId) => {
      return Rx.Observable.fromPromise(models.FormFields.destroy({
        where: { id: fieldId }
      }));
    });
};

var deleteFormFields$ = (formId) => {
  return formFields$(formId)
    .flatMap(Rx.Observable.fromArray)
    .flatMap((field) => {
      return Rx.Observable.fromPromise(models.FormFields.destroy({
        where: { id: field.id }
      }));
    });
};

router.get('/', (req, res) => {
  return Rx.Observable.fromPromise(models.Forms.findAll())
    .flatMap(Rx.Observable.fromArray)
    .map(filterStampsAndNulls)
    .flatMap((form) => {
      return Rx.Observable.create((subscriber) => {
        formFields$(form.id)
          .subscribe((fields) => {
            form.fields = fields;
            subscriber.onNext(form);
            subscriber.onCompleted();
          }, (err) => subscriber.onError(err));
      });
    })
    .toArray()
    .subscribe(forms => res.json(forms), err => console.log(err));
});

router.get('/:formId', (req, res) => {
  return Rx.Observable.fromPromise(models.Forms.findById(req.params.formId))
    .map(filterStampsAndNulls)
    .flatMap((form) => {
      return Rx.Observable.create((subscriber) => {
        formFields$(form.id)
          .subscribe((fields) => {
            form.fields = fields;
            subscriber.onNext(form);
            subscriber.onCompleted();
          }, (err) => subscriber.onError(err));
      });
    })
    .subscribe(forms => res.json(forms), err => console.log(err));
});

router.get('/:formId/results', (req, res) => {
  return Rx.Observable.fromPromise(models.FormData.findAll({
    where: {
      form_id: req.params.formId
    }
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
  return Rx.Observable.fromPromise(models.FormData.create(formData))
    .map(filterStampsAndNulls)
    .subscribe(formData => res.json(formData), err => console.log(err));
});

router.post('/', (req, res) => {
  return Rx.Observable.fromPromise(models.Forms.create(req.body))
    .map(filterStampsAndNulls)
    .map(form => {
      form.fields = [];
      return form;
    })
    .subscribe(formData => res.json(formData), err => console.log(err));
});

router.put('/:formId', (req, res) => {
  return Rx.Observable.fromPromise(models.Forms.update(req.body.form, {
    where: {
      id: req.params.formId
    }
  }))
    .merge(updateFields$(req.params.formId, req.body.form.fields))
    .merge(deleteFields$(req.body.deletedFields))
    .toArray()
    .subscribe(r => res.json(r), err => console.log(err));
});

router.delete('/:formId', (req, res) => {
  return Rx.Observable.fromPromise(models.Forms.destroy({
    where: {
      id: req.params.formId
    }
  }))
    .merge(deleteFormFields$(req.params.formId))
    .toArray()
    .subscribe(r => res.json(r), err => console.log(err));
});

module.exports = router;
