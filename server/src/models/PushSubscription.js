const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PushSubscription = sequelize.define('PushSubscription', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  endpoint: { type: DataTypes.TEXT, allowNull: false },
  p256dh: { type: DataTypes.TEXT, allowNull: false },
  auth: { type: DataTypes.TEXT, allowNull: false },
}, {
  tableName: 'push_subscriptions',
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [{ fields: ['user_id'] }],
});

module.exports = PushSubscription;
