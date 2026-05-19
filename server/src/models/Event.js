const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  organizer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  location_type: {
    type: DataTypes.ENUM('hall', 'department', 'auditorium', 'field', 'online', 'other'),
    allowNull: false,
  },
  venue: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  contact_info: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  cover_image_url: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: 'events',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['start_time', 'is_public']
    }
  ]
});

module.exports = Event;
