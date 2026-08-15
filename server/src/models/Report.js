const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  reporter_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  post_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  reason: {
    type: DataTypes.ENUM('spam', 'harassment', 'inappropriate', 'misinformation', 'other'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'resolved', 'dismissed'),
    defaultValue: 'pending',
  },
  resolved_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'reports',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { unique: true, fields: ['reporter_id', 'post_id'] }
  ]
});

module.exports = Report;
