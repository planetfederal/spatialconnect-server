'use strict';

module.exports = (sequelize,DataTypes) => {
  var Store = sequelize.define('Stores',{
    id : {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey : true
    },
    store_type : DataTypes.STRING,
    version : DataTypes.FLOAT,
    uri : DataTypes.STRING,
    name : DataTypes.STRING
  },{
    timestamps : true,
    paranoid : true,
    underscored : true,
    tableName : 'stores'
  });
  return Store;
};
