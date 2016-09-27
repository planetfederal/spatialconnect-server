'use strict';

var Rx = require('rx');
var _ = require('lodash');

const tKeys = ['created_at', 'updated_at', 'deleted_at'];

var filterStampsAndNulls = (ff) => {
  return _.chain(ff.dataValues)
    .omit(tKeys)
    .omitBy(_.isNull)
    .value();
};

module.exports = (sequelize,DataTypes) => {
  var Forms = sequelize.define('Forms',{
    version : DataTypes.INTEGER,
    form_key : DataTypes.STRING,
    form_label : DataTypes.STRING
  },{
    timestamps : true,
    paranoid : true,
    underscored : true,
    tableName : 'forms',
    classMethods : {
      associate : (models) => {
        models.Forms.hasMany(models.FormFields);
        models.Forms.hasMany(models.FormData);
      },
      uniqueForms$ : (models) => {
        return Rx.Observable.fromPromise(
          sequelize.query('SELECT DISTINCT form_key FROM forms where deleted_at is null',
          {type: sequelize.QueryTypes.SELECT})
        ).flatMap(Rx.Observable.fromArray)
        .flatMap((f) => {
          return Rx.Observable.fromPromise(models.Forms.findOne({
            where : {
              form_key : f.form_key
            },
            order : [
                ['version','DESC']
            ]
          }));
        }).map((f) => {
          //Return only the actual values from the sql obj
          return filterStampsAndNulls(f);
        });
      },
      formDefinition$ : (models,formId) => {
        let form = Rx.Observable.fromPromise(
          models.Forms.findOne({
            where : {
              id : formId
            }
          })).map(filterStampsAndNulls);

        let formFields = models.FormFields.formFields$(models,formId);

        return Rx.Observable.combineLatest(form,formFields,(f,ff) => {
          f.fields = ff;
          return f;
        });
      },
      formMetadata$ : (models,form) => {
        let count =  Rx.Observable.fromPromise(
          models.FormData.count({
            where : {
              form_id : form.id
            }
          }));

        let lastActivity = Rx.Observable.fromPromise(
          models.FormData.find({
            where : {
              form_id : form.id
            },
            order: 'id desc',
            limit: 1
          }));

        return Rx.Observable.combineLatest(count,lastActivity,(c,la) => {
          return {
            ...form,
            metadata: {
              ...form.metadata,
              count: c,
              lastActivity: la ? la.dataValues.updated_at : false
            }
          };
        });
      }
    }
  });
  return Forms;
};
