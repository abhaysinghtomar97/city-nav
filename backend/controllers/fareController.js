const FareRule = require('../models/FareRule');

exports.getFareRules = async (req, res, next) => {
  try {
    const { cityId, vehicleType } = req.query;
    const query = {};
    if (cityId) query.city = cityId;
    if (vehicleType) query.vehicleType = vehicleType;

    const rules = await FareRule.find(query).populate('city', 'name').sort({ vehicleType: 1 });
    res.json({ success: true, count: rules.length, fareRules: rules });
  } catch (err) { next(err); }
};

exports.getFareRule = async (req, res, next) => {
  try {
    const rule = await FareRule.findById(req.params.id).populate('city', 'name');
    if (!rule) return res.status(404).json({ success: false, message: 'Fare rule not found.' });
    res.json({ success: true, fareRule: rule });
  } catch (err) { next(err); }
};

exports.createFareRule = async (req, res, next) => {
  try {
    const rule = await FareRule.create(req.body);
    res.status(201).json({ success: true, fareRule: rule });
  } catch (err) { next(err); }
};

exports.updateFareRule = async (req, res, next) => {
  try {
    const rule = await FareRule.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!rule) return res.status(404).json({ success: false, message: 'Fare rule not found.' });
    res.json({ success: true, fareRule: rule });
  } catch (err) { next(err); }
};

exports.deleteFareRule = async (req, res, next) => {
  try {
    const rule = await FareRule.findByIdAndDelete(req.params.id);
    if (!rule) return res.status(404).json({ success: false, message: 'Fare rule not found.' });
    res.json({ success: true, message: 'Fare rule deleted.' });
  } catch (err) { next(err); }
};