const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Chat = sequelize.define('Chat', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  type: {
    type: DataTypes.ENUM('direct', 'group'),
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true, // For group chats
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  tableName: 'chats',
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Chat;
