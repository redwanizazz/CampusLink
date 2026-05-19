const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SemesterResult = sequelize.define('SemesterResult', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  academic_year: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  semester: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  gpa: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
  },
  cgpa: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
  },
  total_credits: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  result_status: {
    type: DataTypes.ENUM('passed', 'failed', 'incomplete'),
    allowNull: true,
  }
}, {
  tableName: 'semester_results',
  createdAt: 'published_at',
  updatedAt: false
});

module.exports = SemesterResult;
