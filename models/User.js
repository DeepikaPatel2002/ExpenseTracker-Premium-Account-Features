



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
  },
  totalExpense: {
  type: DataTypes.DOUBLE,
  defaultValue: 0
}

});

module.exports = User;