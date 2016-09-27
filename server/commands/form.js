'use strict';

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

let updateFields = (formId, fields) => {
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

module.exports = (() => {
  return {
    CHANNEL_FORM_SUBMIT : '@@channel/form_submit',
    CHANNEL_FORM_CREATE : '@@channel/form_create',
    CHANNEL_FORM_DELETE : '@@channel/form_delete',
    CHANNEL_FORM_UPDATE : '@@channel/form_update',
    forms : () => {
      return models.Forms.uniqueForms$(models)
      .flatMap(form => models.Forms.formDefinition$(models, form.id))
      .flatMap(form => models.Forms.formMetadata$(models, form))
      .toArray();
    },
    form : key => {
      return models.Forms.uniqueForms$(models)
      .filter(form => form.form_key === key)
      .flatMap(form => models.Forms.formDefinition$(models, form.id))
      .flatMap(form => models.Forms.formMetadata$(models, form));
    },
    formResults : id => {
      return Rx.Observable.fromPromise(
      models.FormData.findAll({
        where: { form_id: id }
      }))
      .flatMap(Rx.Observable.fromArray)
      .map(filterStampsAndNulls)
      .toArray();
    },
    formSubmit : (id,val) => {
      let formData = {
        val,
        form_id:id
      };
      return Rx.Observable.fromPromise(
      models.FormData.create(formData))
      .map(filterStampsAndNulls);
    },
    createForm : (form) => {
      let formId;
      let fields = form.fields;
      return Rx.Observable.fromPromise(
      models.Forms.create(form))
      .flatMap((form) => {
        formId = form.dataValues.id;
        return updateFields(formId, fields);
      })
      .materialize()
      .filter(x => {
        return x.kind === 'C' || x.kind === 'E';
      })
      .flatMap(x => {
        return formId ?
          models.Forms.formDefinition$(models,formId):
          Rx.Observable.throw(x);
      });
    },
    deleteForm : key => {
      return Rx.Observable.fromPromise(
      models.Forms.findAll({
        where: { form_key: key }
      }))
      .flatMap(Rx.Observable.fromArray)
      .flatMap(ff => {
        return Rx.Observable.fromPromise(models.Forms.destroy({
          where: { id: ff.dataValues.id }
        }));
      })
      .toArray();
    }
  };
})();
