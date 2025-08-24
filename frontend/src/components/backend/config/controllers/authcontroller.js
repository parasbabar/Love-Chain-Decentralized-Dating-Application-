const User = require('../models/User');
const Profile = require('../models/Profile');
const { generateAuthToken } = require('../utils/aptos');
const { validateSignature } = require('../utils/validation');

// Connect wallet and create user profile
const walletConnect = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { walletAddress, signature, username } = req.body;

    // Validate signature
    const isValidSignature = await validateSignature(walletAddress, signature);
    if (!isValidSignature) {
      return res.status(401).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    // Check if user already exists
    let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Check if username is available
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken'
      });
    }

    // Create new user
    user = new User({
      walletAddress: walletAddress.toLowerCase(),
      username
    });

    // Create profile for user
    const profile = new Profile({
      user: user._id
    });

    await profile.save();
    
    user.profile = profile._id;
    await user.save();

    // Generate JWT token
    const token = generateAuthToken(user);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      token,
      user: user.getPublicData()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

// Login with wallet
const walletLogin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { walletAddress, signature } = req.body;

    // Validate signature
    const isValidSignature = await validateSignature(walletAddress, signature);
    if (!isValidSignature) {
      return res.status(401).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    // Find user
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() })
      .populate('profile');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateAuthToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: user.getPublicData()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

module.exports = {
  walletConnect,
  walletLogin
};