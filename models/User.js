

// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/db');

// const User = sequelize.define('User', {
//   id: {
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//     allowNull: false,
//     primaryKey: true
//   },
//   username: {
//     type: DataTypes.STRING,
//     allowNull: false
//   },
//   email: {
//     type: DataTypes.STRING,
//     unique: true,
//     allowNull: false
//   },
//   password: {
//     type: DataTypes.STRING,
//     allowNull: false
//   }
// });

// module.exports = User;










//chatGPT
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  username: {
    type: DataTypes.STRING,
    allowNull: false
  },

  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false
  },

  isPremiumUser: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = User;