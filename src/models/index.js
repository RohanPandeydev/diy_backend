"use strict";
require("dotenv/config.js");
const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const process = require("process");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../../config/config.js")[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);
(async function () {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    );
  }) 
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});
(async function () {
  try {
    await sequelize.sync({ alter: false });
    console.log("All models were synchronized successfully.");
  } catch (error) {
    console.error("Unable to synchronized to the models:", error);
  }
})();

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
