const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PostLike = sequelize.define('PostLike', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  post_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  tableName: 'post_likes',
  createdAt: 'liked_at',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['post_id', 'user_id']
    }
  ]
});

module.exports = PostLike;
