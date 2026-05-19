const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChatMember = sequelize.define('ChatMember', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  chat_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  tableName: 'chat_members',
  createdAt: 'joined_at',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['chat_id', 'user_id']
    }
  ]
});

module.exports = ChatMember;
