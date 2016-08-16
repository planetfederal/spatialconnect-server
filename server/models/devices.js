'use strict';

var Rx = require('rx');

module.exports = (sequelize,DataTypes) => {
  var Devices = sequelize.define('Devices',{
    identifier : {
      type : DataTypes.STRING,
      primaryKey : true,
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
        models.Devices.hasMany(models.DeviceLocations);
      },
      findByIdentifier: (models,ident) => {
        return Rx.Observable.fromPromise(models.Devices.findOne({
          where : {
            identifier : ident
          }
        }));
      },
      register : (models,payload) => {
        return Rx.Observable.fromPromise(models.Devices.upsert(payload,{
          where : {
            identifier : payload.identifier
          }
        }));
      }
    }
  });
  return Devices;
};
