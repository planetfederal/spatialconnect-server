'use strict';

module.exports = (sequelize,DataTypes) => {
  var Forms = sequelize.define('Forms',{
    name : DataTypes.STRING
  },{
    timestamps : true,
    paranoid : true,
    underscored : true,
    tableName : 'forms',
    classMethods : {
      associate : (models) => {
        models.Forms.hasMany(models.FormFields);
        models.Forms.hasMany(models.FormData);
      }
    }
  });
  return Forms;
};
