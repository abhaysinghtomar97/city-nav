const TripQuery = require('../models/TripQuery');
const User = require('../models/User');

// GET /api/history
exports.getHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = req.user ? { user: req.user._id } : { sessionId: req.headers['x-session-id'] };

    const [trips, total] = await Promise.all([
      TripQuery.find(query)
        .populate('city', 'name state')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      TripQuery.countDocuments(query)
    ]);

    res.json({
      success: true,
      trips,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) { next(err); }
};

// DELETE /api/history/:id
exports.deleteHistory = async (req, res, next) => {
  try {
    const trip = await TripQuery.findOne({ _id: req.params.id, user: req.user._id });
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found.' });
    await trip.deleteOne();
    res.json({ success: true, message: 'Trip deleted from history.' });
  } catch (err) { next(err); }
};

// GET /api/profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('preferredCity', 'name state');
    const tripCount = await TripQuery.countDocuments({ user: req.user._id });
    res.json({ success: true, user, stats: { totalTrips: tripCount } });
  } catch (err) { next(err); }
};

// PUT /api/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, preferredCity } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (preferredCity !== undefined) updates.preferredCity = preferredCity || null;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true })
      .populate('preferredCity', 'name state');
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

// PUT /api/profile/password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both currentPassword and newPassword are required.' });
    }
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) { next(err); }
};