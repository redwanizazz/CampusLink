const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  enrollment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  class_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'late', 'excused'),
    allowNull: false,
  },
  marked_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  tableName: 'attendance',
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      fields: ['enrollment_id', 'class_date']
    }
  ]
});

module.exports = Attendance;
