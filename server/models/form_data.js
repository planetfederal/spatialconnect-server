'use strict';

module.exports = (sequelize,DataTypes) => {
  var FormFields = sequelize.define('FormData',{
    val : DataTypes.JSON
  },{
    timestamps : true,
    paranoid : true,
    underscored : true,
    tableName : 'form_data'
  });
  return FormFields;
};
