const City = require('../models/City');
const Location = require('../models/Location');
const TripQuery = require('../models/TripQuery');
const routingService = require('../services/routingService');
const fareService = require('../services/fareService');

// ✅ If Node < 18 → uncomment below
// const fetch = require('node-fetch');

/**
 * Resolve a location by name or ID within a city.
 */
async function resolveLocation(nameOrId, cityId) {
  let loc = null;

  // Try ObjectId
  if (/^[0-9a-fA-F]{24}$/.test(nameOrId)) {
    loc = await Location.findById(nameOrId);
    if (loc) return loc;
  }

  // Try DB match
  loc = await Location.findOne({
    city: cityId,
    isActive: true,
    $or: [
      { name: { $regex: new RegExp('^' + nameOrId + '$', 'i') } },
      { aliases: { $elemMatch: { $regex: new RegExp('^' + nameOrId + '$', 'i') } } }
    ]
  });

  if (loc) return loc;

  console.log("Searching:", nameOrId);

  // 🔥 FALLBACK → Nominatim
  
    const url = `https://nominatim.openstreetmap.org/search?q=${nameOrId}&format=json&limit=1`;

try {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'city-nav-app'
    }
  });

  const text = await res.text(); // 🔥 read as text first

  if (!text) return null;

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.log("Invalid JSON from Nominatim:", text);
    return null;
  }

  if (data && data[0]) {
    return {
      _id: null,
      name: nameOrId,
      coordinates: {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      },
      isDynamic: true
    };
  }
} catch (err) {
  console.error("Nominatim error:", err);
}

  return null;
}

// @desc Estimate route
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
      city = await City.findOne({
        name: { $regex: new RegExp(cityName, 'i') },
        isActive: true
      });
    }

    if (!city) {
      return res.status(404).json({
        success: false,
        message: 'City not found or not supported.'
      });
    }

    if (!city.isActive) {
      return res.status(400).json({
        success: false,
        message: 'City is currently unavailable.'
      });
    }

    if (vehicleType !== 'all' && !city.supportedVehicles.includes(vehicleType)) {
      return res.status(400).json({
        success: false,
        message: `${vehicleType} is not supported in ${city.name}.`
      });
    }

    // 🔥 Resolve locations
    const [srcLoc, destLoc] = await Promise.all([
      resolveLocation(source, city._id),
      resolveLocation(destination, city._id)
    ]);

    console.log("SRC:", srcLoc);
    console.log("DEST:", destLoc);

    // 🔥 STEP 1: HANDLE DYNAMIC FIRST
    if (
      (srcLoc && srcLoc.isDynamic === true) ||
      (destLoc && destLoc.isDynamic === true)
    ) {
      return res.json({
        success: true,
        message: "Dynamic location used (no graph route available)",
        city: { id: city._id, name: city.name, state: city.state },
        source: {
          name: srcLoc?.name || source,
          coordinates: srcLoc?.coordinates
        },
        destination: {
          name: destLoc?.name || destination,
          coordinates: destLoc?.coordinates
        },
        vehicleType,
        results: {
          [vehicleType]: {
            route: {
              path: [srcLoc, destLoc].filter(Boolean).map(loc => ({
  name: loc.name,
  lat: loc.coordinates?.lat || loc.lat,
  lng: loc.coordinates?.lng || loc.lng
})),
              steps: [],
              totalDistanceKm: 0,
              estimatedDurationMin: 0
            },
            fare: null
          }
        },
        hasResults: true,
        timestamp: new Date().toISOString()
      });
    }

    // 🔥 STEP 2: VALIDATION
    if (!srcLoc) {
      return res.status(404).json({
        success: false,
        message: `Source "${source}" not found in ${city.name}.`
      });
    }

    if (!destLoc) {
      return res.status(404).json({
        success: false,
        message: `Destination "${destination}" not found in ${city.name}.`
      });
    }

    // 🔥 STEP 3: SAFE SAME LOCATION CHECK
    if (
      srcLoc._id &&
      destLoc._id &&
      srcLoc._id.equals(destLoc._id)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Source and destination cannot be the same.'
      });
    }

    const vehiclesToProcess =
      vehicleType === 'all' ? city.supportedVehicles : [vehicleType];

    const results = {};

    for (const vType of vehiclesToProcess) {
      const route = await routingService.estimateRoute(
        city._id,
        srcLoc._id,
        destLoc._id,
        vType
      );

      if (!route) {
  results[vType] = {
    route: {
      path: [srcLoc, destLoc].filter(Boolean).map(loc => ({
  name: loc.name,
  lat: loc.coordinates?.lat || loc.lat,
  lng: loc.coordinates?.lng || loc.lng
})),
      steps: [],
      totalDistanceKm: 0,
      estimatedDurationMin: 0
    },
    fare: null,
    note: "Direct route (no graph path available)"
  };
  continue;
}

      const fareRule = await fareService.getFareRule(city._id, vType);
      const fareBreakdown = fareService.calculateFare(route.totalDistanceKm, fareRule);
      const adjustedDuration = fareService.applyTrafficFactor(route.totalDurationMin, vType);

      results[vType] = {
        route: {
          path: route.path.map(loc => ({
  name: loc.name,
  lat: loc.lat,
  lng: loc.lng
})),
          steps: route.steps,
          totalDistanceKm: route.totalDistanceKm,
          estimatedDurationMin: adjustedDuration
        },
        fare: fareBreakdown,
        vehicleType: vType
      };
    }

    return res.json({
      success: true,
      city: { id: city._id, name: city.name },
      source: { name: srcLoc.name },
      destination: { name: destLoc.name },
      vehicleType,
      results
    });

  } catch (err) {
    next(err);
  }
};


// compare
exports.compareRoutes = async (req, res, next) => {
  req.body.vehicleType = 'all';
  return exports.estimateRoute(req, res, next);
};

// autocomplete
exports.autocomplete = async (req, res, next) => {
  try {
    const { cityId, q } = req.query;

    if (!q || q.length < 2) {
      return res.json({ success: true, suggestions: [] });
    }

    const locations = await Location.find({
      city: cityId,
      isActive: true,
      name: { $regex: q, $options: 'i' }
    }).limit(10);

    res.json({
      success: true,
      suggestions: locations
    });
  } catch (err) {
    next(err);
  }
};