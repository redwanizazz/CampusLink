const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User, Department } = require('../models');
const { sendPasswordResetEmail } = require('../utils/mailer');

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d' }
  );
};

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const register = async (req, res) => {
  try {
    const { student_id, full_name, email, password, department_id, batch } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    const existingStudentId = await User.findOne({ where: { student_id } });
    if (existingStudentId) {
      return res.status(400).json({ error: 'Student ID already in use' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      student_id,
      full_name,
      email,
      password_hash,
      department_id,
      batch
    });

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        student_id: newUser.student_id,
        full_name: newUser.full_name,
        email: newUser.email,
        role: newUser.role
      },
      accessToken,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        student_id: user.student_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      },
      accessToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] },
      include: [{ model: Department, attributes: ['id', 'name', 'code'] }]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const refresh = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ error: 'No refresh token' });

    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByPk(payload.id);
    if (!user) return res.status(401).json({ error: 'User not found' });

    const accessToken = generateAccessToken(user);
    res.json({ accessToken });
  } catch {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
};

const logout = (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  res.json({ message: 'Logged out successfully' });
};

const forgotPassword = async (req, res) => {
  const SAFE_MSG = 'If that email is registered, a reset link has been sent.';
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.json({ message: SAFE_MSG });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await user.update({ reset_token: token, reset_token_expires: expires });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
    try {
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (mailErr) {
      console.error('Email send failed (token still saved):', mailErr.message);
      console.info(`Reset URL for ${user.email}: ${resetUrl}`);
    }

    res.json({ message: SAFE_MSG });
  } catch (error) {
    console.error('ForgotPassword error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      where: {
        reset_token: token,
        reset_token_expires: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    await user.update({ password_hash, reset_token: null, reset_token_expires: null });

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    console.error('ResetPassword error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  register,
  login,
  getMe,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
};
