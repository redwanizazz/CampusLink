const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Mark = sequelize.define('Mark', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  enrollment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  exam_type: {
    type: DataTypes.ENUM('CT1', 'CT2', 'CT3', 'assignment', 'midterm', 'final'),
    allowNull: false,
  },
  marks_obtained: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
  },
  total_marks: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
  },
  recorded_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  tableName: 'marks',
  createdAt: 'recorded_at',
  updatedAt: false
});

module.exports = Mark;
