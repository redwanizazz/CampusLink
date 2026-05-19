const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  student_id: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('student', 'faculty', 'staff', 'admin'),
    defaultValue: 'student',
  },
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  batch: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  avatar_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  reset_token: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  reset_token_expires: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  tableName: 'users',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = User;
