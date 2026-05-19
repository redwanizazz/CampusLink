const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Enrollment = sequelize.define('Enrollment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  academic_year: {
    type: DataTypes.STRING,
    allowNull: false, // E.g., '2025-2026'
  },
  semester: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  tableName: 'enrollments',
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'course_id', 'academic_year', 'semester']
    }
  ]
});

module.exports = Enrollment;
