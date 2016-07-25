'use strict';

module.exports = (sequelize,DataTypes) => {
  var Devices = sequelize.define('Devices',{
    identifier : {
      type : DataTypes.STRING,
      unique : true
    },
    device_info : DataTypes.JSON
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
