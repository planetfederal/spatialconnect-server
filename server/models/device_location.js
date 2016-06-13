'use strict';

module.exports = (sequelize,DataTypes) => {
  var DeviceLocations = sequelize.define('DeviceLocations',{
      x : DataTypes.FLOAT,
      y : DataTypes.FLOAT,
      z : DataTypes.FLOAT
  },{
    timestamps : true,
    paranoid : true,
    underscored : true,
    tableName : 'device_locations'
  });
  return DeviceLocations;
};
