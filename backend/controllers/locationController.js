const Location = require('../models/Location');

exports.getLocations = async (req, res, next) => {
  try {
    const { cityId, type, search } = req.query;
    const query = { isActive: true };
    if (cityId) query.city = cityId;
    if (type) query.type = type;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { aliases: { $elemMatch: { $regex: search, $options: 'i' } } }
    ];

    const locations = await Location.find(query).populate('city', 'name').sort({ name: 1 });
    res.json({ success: true, count: locations.length, locations });
  } catch (err) { next(err); }
};

exports.getLocation = async (req, res, next) => {
  try {
    const location = await Location.findById(req.params.id).populate('city', 'name');
    if (!location) return res.status(404).json({ success: false, message: 'Location not found.' });
    res.json({ success: true, location });
  } catch (err) { next(err); }
};

exports.createLocation = async (req, res, next) => {
  try {
    const location = await Location.create(req.body);
    res.status(201).json({ success: true, location });
  } catch (err) { next(err); }
};

exports.updateLocation = async (req, res, next) => {
  try {
    const location = await Location.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!location) return res.status(404).json({ success: false, message: 'Location not found.' });
    res.json({ success: true, location });
  } catch (err) { next(err); }
};

exports.deleteLocation = async (req, res, next) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);
    if (!location) return res.status(404).json({ success: false, message: 'Location not found.' });
    res.json({ success: true, message: 'Location deleted.' });
  } catch (err) { next(err); }
};