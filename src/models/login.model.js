"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class login extends Model {
    static associate(models) {
      // define association here
    }
  }

  login.init(
    {
      email: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      hashedPassword: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      salt: {
        type: DataTypes.STRING(32),
        allowNull: false,
      },
      loginSessions: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
      }
    },
    {
      sequelize,
      modelName: "login", // uncommented
    }
  );

  return login;
};
