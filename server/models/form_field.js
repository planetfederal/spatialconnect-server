'use strict';

module.exports = (sequelize,DataTypes) => {
  var FormFields = sequelize.define('FormFields',{
    id : {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey : true
    },
    type : DataTypes.STRING,
    label : DataTypes.STRING,
    key : DataTypes.STRING,
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
    tableName : 'form_field'
  });
  return FormFields;
};
