'use strict';
module.exports = function(sequelize, DataTypes) {
  var Operations = sequelize.define('Operations', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    geogig_repo_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    geogig_commit_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    geogig_tree: {
      type: DataTypes.STRING,
      allowNull: false
    },
    geogig_feature_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    audit_op: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    audit_timestamp: {
      type: DataTypes.TIME,
      allowNull: false
    },
    properties: {
      type: DataTypes.JSON,
      allowNull: false
    }
  },
  {
    timestamps : true,
    paranoid : true,
    underscored : true,
    tableName : 'operations',
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Operations;
};
