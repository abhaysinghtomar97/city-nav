const City = require('../models/City');
const Location = require('../models/Location');
const TripQuery = require('../models/TripQuery');
const routingService = require('../services/routingService');
const fareService = require('../services/fareService');

/**
 * Resolve a location by name or ID within a city.
 */
async function resolveLocation(nameOrId, cityId) {
  // Try exact ObjectId match first
  if (/^[0-9a-fA-F]{24}$/.test(nameOrId)) {
    const loc = await Location.findById(nameOrId);
    if (loc) return loc;
  }

  // Search by name or alias (case-insensitive)
  const loc = await Location.findOne({
    city: cityId,
    isActive: true,
    $or: [
      { name: { $regex: new RegExp('^' + nameOrId + '$', 'i') } },
      { aliases: { $elemMatch: { $regex: new RegExp('^' + nameOrId + '$', 'i') } } }
    ]
  });
  return loc;
}

// @desc    Estimate route and fare
// @route   POST /api/routes/estimate
// @access  Public (optionally authenticated)
exports.estimateRoute = async (req, res, next) => {
  try {
    const { cityId, cityName, source, destination, vehicleType } = req.body;

    if (!source || !destination || !vehicleType) {
      return res.status(400).json({
        success: false,
        message: 'source, destination, and vehicleType are required.'
      });
    }

    // Resolve city
    let city;
    if (cityId) {
      city = await City.findById(cityId);
    } else if (cityName) {
      city = await City.findOne({ name: { $regex: new RegExp(cityName, 'i') }, isActive: true });
    }

    if (!city) {
      return res.status(404).json({ success: false, message: 'City not found or not supported.' });
    }

    if (!city.isActive) {
      return res.status(400).json({ success: false, message: 'City is currently unavailable.' });
    }

    if (vehicleType !== 'all' && !city.supportedVehicles.includes(vehicleType)) {
      return res.status(400).json({
        success: false,
        message: `${vehicleType} is not supported in ${city.name}. Supported: ${city.supportedVehicles.join(', ')}`
      });
    }

    // Resolve locations
    const [srcLoc, destLoc] = await Promise.all([
      resolveLocation(source, city._id),
      resolveLocation(destination, city._id)
    ]);

    if (!srcLoc) {
      return res.status(404).json({ success: false, message: `Source "${source}" not found in ${city.name}.` });
    }
    if (!destLoc) {
      return res.status(404).json({ success: false, message: `Destination "${destination}" not found in ${city.name}.` });
    }
    if (srcLoc._id.equals(destLoc._id)) {
      return res.status(400).json({ success: false, message: 'Source and destination cannot be the same.' });
    }

    const vehiclesToProcess = vehicleType === 'all' ? city.supportedVehicles : [vehicleType];
    const results = {};
    let routeResult = null;

    for (const vType of vehiclesToProcess) {
      const route = await routingService.estimateRoute(city._id, srcLoc._id, destLoc._id, vType);

      if (!route) {
        results[vType] = { error: `No route found for ${vType} between these locations.` };
        continue;
      }

      const fareRule = await fareService.getFareRule(city._id, vType);
      const fareBreakdown = fareService.calculateFare(route.totalDistanceKm, fareRule);
      const adjustedDuration = fareService.applyTrafficFactor(route.totalDurationMin, vType);

      results[vType] = {
        route: {
          path: route.path,
          steps: route.steps,
          totalDistanceKm: route.totalDistanceKm,
          estimatedDurationMin: adjustedDuration,
          baseDurationMin: route.totalDurationMin
        },
        fare: fareBreakdown,
        vehicleType: vType
      };

      if (!routeResult) routeResult = route;
    }

    // Save query to history
    const primaryVehicle = vehiclesToProcess[0];
    const primaryResult = results[primaryVehicle];

    const tripQuery = await TripQuery.create({
      user: req.user ? req.user._id : null,
      city: city._id,
      source: { name: srcLoc.name, locationId: srcLoc._id, coordinates: srcLoc.coordinates },
      destination: { name: destLoc.name, locationId: destLoc._id, coordinates: destLoc.coordinates },
      vehicleType,
      result: primaryResult && !primaryResult.error ? {
        totalDistanceKm: primaryResult.route.totalDistanceKm,
        estimatedDurationMin: primaryResult.route.estimatedDurationMin,
        estimatedFare: primaryResult.fare.total,
        fareBreakdown: primaryResult.fare,
        routePath: primaryResult.route.path,
        steps: primaryResult.route.steps
      } : {},
      isGuest: !req.user,
      sessionId: req.headers['x-session-id'] || null
    });

    const hasAnyResult = Object.values(results).some(r => !r.error);

    res.json({
      success: true,
      queryId: tripQuery._id,
      city: { id: city._id, name: city.name, state: city.state },
      source: { id: srcLoc._id, name: srcLoc.name, coordinates: srcLoc.coordinates },
      destination: { id: destLoc._id, name: destLoc.name, coordinates: destLoc.coordinates },
      vehicleType,
      results,
      hasResults: hasAnyResult,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Compare all vehicle types for a route
// @route   POST /api/routes/compare
// @access  Public
exports.compareRoutes = async (req, res, next) => {
  req.body.vehicleType = 'all';
  return exports.estimateRoute(req, res, next);
};

// @desc    Get autocomplete suggestions for locations
// @route   GET /api/routes/autocomplete?cityId=...&q=...
// @access  Public
exports.autocomplete = async (req, res, next) => {
  try {
    const { cityId, q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ success: true, suggestions: [] });
    }

    const query = {
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { aliases: { $elemMatch: { $regex: q, $options: 'i' } } }
      ]
    };
    if (cityId) query.city = cityId;

    const locations = await Location.find(query)
      .populate('city', 'name')
      .select('name type city coordinates')
      .limit(10);

    res.json({
      success: true,
      suggestions: locations.map(l => ({
        id: l._id,
        name: l.name,
        type: l.type,
        city: l.city?.name,
        coordinates: l.coordinates
      }))
    });
  } catch (err) {
    next(err);
  }
};