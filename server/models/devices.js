'use strict';

module.exports = (sequelize,DataTypes) => {
  var Devices = sequelize.define('Devices',{
    name : DataTypes.STRING,
    identifier : DataTypes.STRING
  },{
    timestamps : true,
    paranoid : true,
    underscored : true,
    tableName : 'devices',
    classMethods : {
      associate : (models) => {
        models.Devices.hasMany(models.FormData);
      }
    }
  });
  return Devices;
};
