const City = require('../models/City');

exports.getCities = async (req, res, next) => {
  try {
    const { active, search } = req.query;
    const query = {};
    if (active === 'true') query.isActive = true;
    if (search) query.$text = { $search: search };

    const cities = await City.find(query).sort({ name: 1 });
    console.log("cities:", cities)
    res.json({ success: true, count: cities.length, cities });
  } catch (err) { next(err); }
};

exports.getCity = async (req, res, next) => {
  try {
    const city = await City.findById(req.params.id);
    if (!city) return res.status(404).json({ success: false, message: 'City not found.' });
    res.json({ success: true, city });
  } catch (err) { next(err); }
};

exports.createCity = async (req, res, next) => {
  try {
    const city = await City.create(req.body);
    res.status(201).json({ success: true, city });
  } catch (err) { next(err); }
};

exports.updateCity = async (req, res, next) => {
  try {
    const city = await City.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!city) return res.status(404).json({ success: false, message: 'City not found.' });
    res.json({ success: true, city });
  } catch (err) { next(err); }
};

exports.deleteCity = async (req, res, next) => {
  try {
    const city = await City.findByIdAndDelete(req.params.id);
    if (!city) return res.status(404).json({ success: false, message: 'City not found.' });
    res.json({ success: true, message: 'City deleted.' });
  } catch (err) { next(err); }
};