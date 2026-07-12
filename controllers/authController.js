const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });

// @route  POST /api/auth/register
// @access Public (in production you may want to restrict this to fleet_manager only)
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    throw new ApiError(400, 'name, email, password and role are all required');
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, 'A user with this email already exists');
  }

  const user = await User.create({ name, email, password, role });
  const token = signToken(user);

  res.status(201).json({
    success: true,
    token,
    user: user.toSafeObject(),
  });
});

// @route  POST /api/auth/login
// @access Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !user.isActive) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const token = signToken(user);

  res.status(200).json({
    success: true,
    token,
    user: user.toSafeObject(),
  });
});

// @route  GET /api/auth/me
// @access Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: req.user.toSafeObject() });
});

module.exports = { register, login, getMe };
