'use strict';

module.exports = (sequelize,DataTypes) => {
  var Users = sequelize.define('Users',{
    name : DataTypes.STRING,
    email : {
      type : DataTypes.STRING,
      isEmail : true,
      unique : true
    },
    password : DataTypes.STRING,
    level : DataTypes.STRING
  },{
    timestamps : true,
    paranoid : true,
    underscored : true,
    tableName : 'users'
  });
  return Users;
};
