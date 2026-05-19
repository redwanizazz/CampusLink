const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EventRSVP = sequelize.define('EventRSVP', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  event_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('going', 'interested', 'not_going'),
    allowNull: false,
  }
}, {
  tableName: 'event_rsvps',
  createdAt: 'responded_at',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['event_id', 'user_id']
    }
  ]
});

module.exports = EventRSVP;
