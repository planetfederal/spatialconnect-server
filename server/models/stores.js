'use strict';

module.exports = (sequelize,DataTypes) => {
  var Store = sequelize.define('Stores',{
    id : {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey : true
    },
    store_type : DataTypes.STRING,
    version : DataTypes.STRING,
    uri : DataTypes.STRING,
    name : DataTypes.STRING,
    default_layer : DataTypes.STRING
  },{
    timestamps : true,
    paranoid : true,
    underscored : true,
    tableName : 'stores'
  });
  return Store;
};
