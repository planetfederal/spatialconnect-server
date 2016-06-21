'use strict';

module.exports = (sequelize,DataTypes) => {
  var Devices = sequelize.define('Devices',{
    name : DataTypes.STRING,
    identifier : {
      type : DataTypes.STRING,
      unique : true
    }
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
