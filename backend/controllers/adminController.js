const User = require('../models/User');
const TripQuery = require('../models/TripQuery');
const City = require('../models/City');
const FareRule = require('../models/FareRule');
const AuditLog = require('../models/AuditLog');
const RouteEdge = require('../models/RouteEdge');

const logAction = (adminId, action, entityType, entityId, changes, ip) =>
  AuditLog.create({ admin: adminId, action, entityType, entityId, changes, ipAddress: ip });

// GET /api/admin/stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [users, cities, trips, recentTrips] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      City.countDocuments({ isActive: true }),
      TripQuery.countDocuments(),
      TripQuery.find().populate('city', 'name').sort({ createdAt: -1 }).limit(10)
    ]);
    res.json({ success: true, stats: { users, cities, trips }, recentTrips });
  } catch (err) { next(err); }
};

// GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { role: 'user' };
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
    const users = await User.find(query).sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(Number(limit));
    const total = await User.countDocuments(query);
    res.json({ success: true, users, total });
  } catch (err) { next(err); }
};

// PUT /api/admin/users/:id/toggle
exports.toggleUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    user.isActive = !user.isActive;
    await user.save();
    await logAction(req.user._id, 'TOGGLE_USER', 'User', user._id, { isActive: user.isActive }, req.ip);
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}.`, user });
  } catch (err) { next(err); }
};

// GET /api/admin/audit-logs
exports.getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find()
      .populate('admin', 'name email')
      .sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, logs });
  } catch (err) { next(err); }
};

// GET /api/admin/routes
exports.getRouteEdges = async (req, res, next) => {
  try {
    const { cityId } = req.query;
    const query = cityId ? { city: cityId } : {};
    const edges = await RouteEdge.find(query)
      .populate('from', 'name').populate('to', 'name').populate('city', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: edges.length, edges });
  } catch (err) { next(err); }
};

// POST /api/admin/routes
exports.createRouteEdge = async (req, res, next) => {
  try {
    const edge = await RouteEdge.create(req.body);
    await logAction(req.user._id, 'CREATE_ROUTE', 'RouteEdge', edge._id, req.body, req.ip);
    res.status(201).json({ success: true, edge });
  } catch (err) { next(err); }
};

// PUT /api/admin/routes/:id
exports.updateRouteEdge = async (req, res, next) => {
  try {
    const edge = await RouteEdge.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!edge) return res.status(404).json({ success: false, message: 'Route not found.' });
    await logAction(req.user._id, 'UPDATE_ROUTE', 'RouteEdge', edge._id, req.body, req.ip);
    res.json({ success: true, edge });
  } catch (err) { next(err); }
};

// DELETE /api/admin/routes/:id
exports.deleteRouteEdge = async (req, res, next) => {
  try {
    const edge = await RouteEdge.findByIdAndDelete(req.params.id);
    if (!edge) return res.status(404).json({ success: false, message: 'Route not found.' });
    await logAction(req.user._id, 'DELETE_ROUTE', 'RouteEdge', req.params.id, {}, req.ip);
    res.json({ success: true, message: 'Route edge deleted.' });
  } catch (err) { next(err); }
};