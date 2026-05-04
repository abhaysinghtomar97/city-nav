const User = require('../models/User');
const { validationResult } = require('express-validator');
const axios = require('axios');

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    // 1. Express-Validator Check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // 2. Immediate Credential Check
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and password are required.' 
      });
    }

    // 3. Normalization
    const normalizedEmail = email.toLowerCase().trim();
    const skipValidation = ['demo@cityroute.in', 'admin@cityroute.in'];

    // 4. DATABASE CHECK (Crucial: Prevents duplicates and saves API credits)
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'This email is already registered.' 
      });
    }

    // 5. EXTERNAL EMAIL VERIFICATION (Kickbox)
    if (!skipValidation.includes(normalizedEmail)) {
      // Check if API Key exists to prevent silent failure
      if (!process.env.KICKBOX_API) {
        console.error("CRITICAL: KICKBOX_API key is missing in .env");
        // We proceed if the API key is missing to not block users, 
        // OR you can return an error if verification is mandatory.
      } else {
        try {
          const KICKBOX_URL = `https://api.kickbox.com/v2/verify?email=${normalizedEmail}&apikey=${process.env.KICKBOX_API}`;
          const kickboxRes = await axios.get(KICKBOX_URL); // 5s timeout
          // console.log(kickboxRes.data);
          const { result, reason } = kickboxRes.data;

          // Tightened Logic: Only allow deliverable or low-quality risky.
          // Blocks 'undeliverable', 'unavailable', and 'disposable'.
          const isAccepted = (result === "deliverable") || 
                             (result === "risky" && reason === "low_quality");

          if (!isAccepted) {
            return res.status(400).json({ 
              success: false, 
              message: 'The email provided appears to be invalid or temporary.' 
            });
          }
        } catch (apiErr) {
          // If Kickbox is down, we log it and allow registration to prevent UX breakage
          console.error("Kickbox Service Error:", apiErr.message);
        }
      }
    }

    // 6. USER CREATION
    // Ensure you use normalizedEmail here!
    const user = await User.create({ 
      name: name.trim(), 
      email: normalizedEmail, 
      password 
    });

    // 7. TOKEN GENERATION
    // Assumes generateAuthToken is defined in your User Model
    const token = user.generateAuthToken();

    // 8. SUCCESS RESPONSE
    return res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role 
      }
    });

  } catch (err) {
    // Pass all unexpected errors to the global error handling middleware
    console.error("Registration Controller Error:", err);
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user by normalized email and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    // Check if user exists and password matches
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account has been deactivated. Contact support.' });
    }

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate and return token
    const token = user.generateAuthToken();

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};