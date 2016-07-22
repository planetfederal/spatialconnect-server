'use strict';

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

module.exports = (sequelize,DataTypes) => {
  var FormFields = sequelize.define('FormFields',{
    id : {
      type : DataTypes.INTEGER,
      autoIncrement : true,
      primaryKey : true
    },
    type : DataTypes.STRING,
    field_label : DataTypes.STRING,
    field_key : DataTypes.STRING,
    is_required : DataTypes.BOOLEAN,
    position : DataTypes.INTEGER,
    initial_value : DataTypes.STRING,
    minimum : DataTypes.STRING,
    maximum : DataTypes.STRING,
    exclusive_minimum : DataTypes.STRING,
    exclusive_maximum : DataTypes.STRING,
    is_integer : DataTypes.BOOLEAN,
    minimum_length : DataTypes.INTEGER,
    maximum_length : DataTypes.INTEGER,
    pattern : DataTypes.STRING,
    options : DataTypes.ARRAY(DataTypes.STRING)
  },{
    timestamps : true,
    paranoid : true,
    underscored : true,
    tableName : 'form_fields',
    classMethods : {
      formFields$ : (models,formId) => {
        return Rx.Observable.fromPromise(
          models.FormFields.findAll({
            where : {
              form_id : formId
            }
          })).flatMap(Rx.Observable.fromArray)
          .map(filterStampsAndNulls).toArray();
      }
    }
  });
  return FormFields;
};
