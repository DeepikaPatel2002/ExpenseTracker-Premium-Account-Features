

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  note: {
  type: DataTypes.STRING,
  allowNull: true
}
});

//  Relation setup
Expense.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(Expense, { foreignKey: 'userId' });

module.exports = Expense;