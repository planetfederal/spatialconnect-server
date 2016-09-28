'use strict';

module.exports = (sequelize,DataTypes) => {
  var Triggers = sequelize.define('Triggers',{
    id : {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey : true
    },
    recipients : DataTypes.ARRAY(DataTypes.STRING),
    definition : DataTypes.JSON
  },{
    timestamps : true,
    paranoid : true,
    underscored : true,
    tableName : 'triggers'
  });
  return Triggers;
};
