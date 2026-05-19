const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FileAttachment = sequelize.define('FileAttachment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  message_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  file_url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  file_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mime_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  file_size_kb: {
    type: DataTypes.INTEGER,
    allowNull: true,
  }
}, {
  tableName: 'file_attachments',
  timestamps: false
});

module.exports = FileAttachment;
