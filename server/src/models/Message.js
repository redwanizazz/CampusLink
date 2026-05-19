const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  chat_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  type: {
    type: DataTypes.ENUM('text', 'file', 'image'),
    defaultValue: 'text',
  },
  read_at: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  tableName: 'messages',
  createdAt: 'sent_at',
  updatedAt: false,
  indexes: [
    {
      fields: ['chat_id', 'sent_at']
    }
  ]
});

module.exports = Message;
