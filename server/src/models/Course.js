const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  code: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  credit_hours: {
    type: DataTypes.DECIMAL(3, 1),
    allowNull: false,
  },
  semester: {
    type: DataTypes.INTEGER,
    allowNull: false, // E.g., 1 to 8
  }
}, {
  tableName: 'courses',
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Course;
