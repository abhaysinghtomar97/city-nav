require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const City = require('../models/City');
const Location = require('../models/Location');
const RouteEdge = require('../models/RouteEdge');
const FareRule = require('../models/FareRule');
const User = require('../models/User');
console.log("env: ", process.env.MONGODB_URI)
const MONGODB_URI = process.env.MONGODB_URI ;

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    City.deleteMany({}), Location.deleteMany({}),
    RouteEdge.deleteMany({}), FareRule.deleteMany({}),
    User.deleteMany({})
  ]);
  console.log('🗑️  Cleared existing data');

  // ─── USERS ────────────────────────────────────────────
const adminUser = await User.create({
  name: 'Admin User',
  email: 'admin@cityroute.in',
  password: 'admin@123',
  role: 'admin'
});

const demoUser = await User.create({
  name: 'Demo User',
  email: 'demo@cityroute.in',
  password: 'demo@123',
  role: 'user'
});
  console.log('👤 Users seeded (admin@cityroute.in / admin@123 & demo@cityroute.in / demo@123)');

  // ─── CITIES ───────────────────────────────────────────
  const delhi = await City.create({
    name: 'Delhi', state: 'Delhi', code: 'DEL',
    coordinates: { lat: 28.6139, lng: 77.2090 },
    supportedVehicles: ['bus', 'auto', 'taxi', 'metro'],
    description: 'Capital of India with extensive metro network and public transport.',
    isActive: true
  });

  const lucknow = await City.create({
    name: 'Lucknow', state: 'Uttar Pradesh', code: 'LKO',
    coordinates: { lat: 26.8467, lng: 80.9462 },
    supportedVehicles: ['bus', 'auto', 'taxi'],
    description: 'City of Nawabs, capital of Uttar Pradesh.',
    isActive: true
  });

  const mumbai = await City.create({
    name: 'Mumbai', state: 'Maharashtra', code: 'MUM',
    coordinates: { lat: 19.0760, lng: 72.8777 },
    supportedVehicles: ['bus', 'auto', 'taxi', 'metro'],
    description: 'Financial capital of India.',
    isActive: true
  });
  console.log('🏙️  Cities seeded');

  // ─── DELHI LOCATIONS ──────────────────────────────────
  const delhiLocs = await Location.insertMany([
    { name: 'Connaught Place', city: delhi._id, type: 'landmark', coordinates: { lat: 28.6289, lng: 77.2065 }, isMetroStation: true, isBusStop: true, aliases: ['CP', 'Rajiv Chowk'] },
    { name: 'India Gate', city: delhi._id, type: 'landmark', coordinates: { lat: 28.6129, lng: 77.2295 }, isBusStop: true, aliases: ['War Memorial'] },
    { name: 'Chandni Chowk', city: delhi._id, type: 'market', coordinates: { lat: 28.6505, lng: 77.2303 }, isMetroStation: true, isBusStop: true, aliases: ['Chandi Chowk'] },
    { name: 'Lajpat Nagar', city: delhi._id, type: 'area', coordinates: { lat: 28.5700, lng: 77.2373 }, isMetroStation: true, isBusStop: true },
    { name: 'Karol Bagh', city: delhi._id, type: 'area', coordinates: { lat: 28.6512, lng: 77.1904 }, isMetroStation: true, isBusStop: true },
    { name: 'Dwarka', city: delhi._id, type: 'area', coordinates: { lat: 28.5823, lng: 77.0500 }, isMetroStation: true, isBusStop: true },
    { name: 'Noida Sector 18', city: delhi._id, type: 'area', coordinates: { lat: 28.5700, lng: 77.3200 }, isMetroStation: true, isBusStop: true, aliases: ['Sector 18', 'Atta Market'] },
    { name: 'IGI Airport', city: delhi._id, type: 'airport', coordinates: { lat: 28.5562, lng: 77.1000 }, isBusStop: true, aliases: ['Indira Gandhi Airport', 'T3', 'Delhi Airport'] },
    { name: 'AIIMS Delhi', city: delhi._id, type: 'hospital', coordinates: { lat: 28.5672, lng: 77.2100 }, isMetroStation: true, isBusStop: true, aliases: ['AIIMS'] },
    { name: 'Hauz Khas', city: delhi._id, type: 'area', coordinates: { lat: 28.5494, lng: 77.2001 }, isMetroStation: true, isBusStop: true },
    { name: 'Saket', city: delhi._id, type: 'area', coordinates: { lat: 28.5244, lng: 77.2066 }, isMetroStation: true, isBusStop: true },
    { name: 'Red Fort', city: delhi._id, type: 'landmark', coordinates: { lat: 28.6562, lng: 77.2410 }, isBusStop: true, aliases: ['Lal Qila'] }
  ]);

  // Build a map for easy reference
  const dL = {};
  for (const l of delhiLocs) dL[l.name] = l;

  // ─── DELHI ROUTE EDGES (bidirectional graph) ──────────
  const delhiEdges = [
    { from: dL['Connaught Place'], to: dL['India Gate'], dist: 2.8, dur: 12 },
    { from: dL['Connaught Place'], to: dL['Chandni Chowk'], dist: 4.5, dur: 20 },
    { from: dL['Connaught Place'], to: dL['Karol Bagh'], dist: 4.2, dur: 18 },
    { from: dL['Connaught Place'], to: dL['AIIMS Delhi'], dist: 5.1, dur: 22 },
    { from: dL['India Gate'], to: dL['AIIMS Delhi'], dist: 3.0, dur: 14 },
    { from: dL['India Gate'], to: dL['Lajpat Nagar'], dist: 5.5, dur: 25 },
    { from: dL['Chandni Chowk'], to: dL['Red Fort'], dist: 1.2, dur: 6 },
    { from: dL['Karol Bagh'], to: dL['Dwarka'], dist: 18.0, dur: 45 },
    { from: dL['AIIMS Delhi'], to: dL['Hauz Khas'], dist: 3.8, dur: 16 },
    { from: dL['AIIMS Delhi'], to: dL['Lajpat Nagar'], dist: 4.0, dur: 18 },
    { from: dL['Hauz Khas'], to: dL['Saket'], dist: 2.5, dur: 10 },
    { from: dL['Hauz Khas'], to: dL['Lajpat Nagar'], dist: 3.5, dur: 15 },
    { from: dL['Lajpat Nagar'], to: dL['Saket'], dist: 3.2, dur: 14 },
    { from: dL['Saket'], to: dL['IGI Airport'], dist: 12.5, dur: 30 },
    { from: dL['Dwarka'], to: dL['IGI Airport'], dist: 8.0, dur: 20 },
    { from: dL['Connaught Place'], to: dL['Noida Sector 18'], dist: 22.0, dur: 50 },
    { from: dL['Lajpat Nagar'], to: dL['Noida Sector 18'], dist: 16.0, dur: 38 }
  ];

  await RouteEdge.insertMany(delhiEdges.map(e => ({
    city: delhi._id, from: e.from._id, to: e.to._id,
    distanceKm: e.dist, durationMinutes: e.dur,
    supportedVehicles: ['bus', 'auto', 'taxi', 'metro'],
    isBidirectional: true, isActive: true
  })));

  // ─── LUCKNOW LOCATIONS ────────────────────────────────
  const lucknowLocs = await Location.insertMany([
    { name: 'Charbagh', city: lucknow._id, type: 'station', coordinates: { lat: 26.8381, lng: 80.9241 }, isBusStop: true, aliases: ['Lucknow Railway Station', 'Charbagh Station'] },
    { name: 'Hazratganj', city: lucknow._id, type: 'area', coordinates: { lat: 26.8500, lng: 80.9468 }, isBusStop: true, aliases: ['Hazrat Ganj'] },
    { name: 'Aminabad', city: lucknow._id, type: 'market', coordinates: { lat: 26.8528, lng: 80.9325 }, isBusStop: true },
    { name: 'Gomti Nagar', city: lucknow._id, type: 'area', coordinates: { lat: 26.8609, lng: 81.0000 }, isBusStop: true },
    { name: 'Alambagh', city: lucknow._id, type: 'area', coordinates: { lat: 26.7882, lng: 80.9076 }, isBusStop: true },
    { name: 'Amausi Airport', city: lucknow._id, type: 'airport', coordinates: { lat: 26.7606, lng: 80.8893 }, isBusStop: true, aliases: ['Lucknow Airport', 'RGIA'] },
    { name: 'Indira Nagar', city: lucknow._id, type: 'area', coordinates: { lat: 26.8836, lng: 81.0040 }, isBusStop: true },
    { name: 'Mahanagar', city: lucknow._id, type: 'area', coordinates: { lat: 26.8700, lng: 80.9700 }, isBusStop: true },
    { name: 'Kaiserbagh', city: lucknow._id, type: 'landmark', coordinates: { lat: 26.8600, lng: 80.9450 }, isBusStop: true }
  ]);

  const lL = {};
  for (const l of lucknowLocs) lL[l.name] = l;

  await RouteEdge.insertMany([
    { city: lucknow._id, from: lL['Charbagh']._id, to: lL['Hazratganj']._id, distanceKm: 2.5, durationMinutes: 15, supportedVehicles: ['bus', 'auto', 'taxi'], isBidirectional: true, isActive: true },
    { city: lucknow._id, from: lL['Charbagh']._id, to: lL['Aminabad']._id, distanceKm: 1.8, durationMinutes: 10, supportedVehicles: ['bus', 'auto', 'taxi'], isBidirectional: true, isActive: true },
    { city: lucknow._id, from: lL['Charbagh']._id, to: lL['Alambagh']._id, distanceKm: 5.0, durationMinutes: 22, supportedVehicles: ['bus', 'auto', 'taxi'], isBidirectional: true, isActive: true },
    { city: lucknow._id, from: lL['Hazratganj']._id, to: lL['Kaiserbagh']._id, distanceKm: 1.2, durationMinutes: 8, supportedVehicles: ['bus', 'auto', 'taxi'], isBidirectional: true, isActive: true },
    { city: lucknow._id, from: lL['Hazratganj']._id, to: lL['Gomti Nagar']._id, distanceKm: 6.0, durationMinutes: 25, supportedVehicles: ['bus', 'auto', 'taxi'], isBidirectional: true, isActive: true },
    { city: lucknow._id, from: lL['Aminabad']._id, to: lL['Mahanagar']._id, distanceKm: 4.5, durationMinutes: 20, supportedVehicles: ['bus', 'auto', 'taxi'], isBidirectional: true, isActive: true },
    { city: lucknow._id, from: lL['Gomti Nagar']._id, to: lL['Indira Nagar']._id, distanceKm: 4.0, durationMinutes: 18, supportedVehicles: ['bus', 'auto', 'taxi'], isBidirectional: true, isActive: true },
    { city: lucknow._id, from: lL['Alambagh']._id, to: lL['Amausi Airport']._id, distanceKm: 6.5, durationMinutes: 20, supportedVehicles: ['bus', 'auto', 'taxi'], isBidirectional: true, isActive: true }
  ]);

  // ─── FARE RULES ────────────────────────────────────────
  const fareRules = [
    // Delhi
    { city: delhi._id, vehicleType: 'bus', baseFare: 0, minimumFare: 10, perKmRate: 3.5, nightSurchargeMultiplier: 1.0, currency: 'INR', notes: 'DTC Bus flat/slab fares' },
    { city: delhi._id, vehicleType: 'auto', baseFare: 25, minimumFare: 30, perKmRate: 9.5, nightSurchargeMultiplier: 1.25, nightStartHour: 23, nightEndHour: 5, currency: 'INR', notes: 'Delhi Auto Rickshaw' },
    { city: delhi._id, vehicleType: 'taxi', baseFare: 50, minimumFare: 60, perKmRate: 14.0, nightSurchargeMultiplier: 1.20, nightStartHour: 23, nightEndHour: 5, currency: 'INR', notes: 'Delhi Cab/OLA/Uber standard' },
    { city: delhi._id, vehicleType: 'metro', baseFare: 10, minimumFare: 10, perKmRate: 2.5, currency: 'INR', notes: 'DMRC Metro fare (approx slab)', slabs: [{ upToKm: 2, ratePerKm: 2 }, { upToKm: 5, ratePerKm: 2.5 }, { upToKm: 12, ratePerKm: 3 }, { upToKm: 21, ratePerKm: 3.5 }, { upToKm: 32, ratePerKm: 4 }] },
    // Lucknow
    { city: lucknow._id, vehicleType: 'bus', baseFare: 0, minimumFare: 8, perKmRate: 3.0, currency: 'INR', notes: 'UPSRTC city bus' },
    { city: lucknow._id, vehicleType: 'auto', baseFare: 20, minimumFare: 25, perKmRate: 8.0, nightSurchargeMultiplier: 1.20, currency: 'INR', notes: 'Lucknow auto rickshaw' },
    { city: lucknow._id, vehicleType: 'taxi', baseFare: 40, minimumFare: 50, perKmRate: 12.0, nightSurchargeMultiplier: 1.15, currency: 'INR', notes: 'Lucknow cab service' },
    // Mumbai
    { city: mumbai._id, vehicleType: 'bus', baseFare: 0, minimumFare: 6, perKmRate: 2.5, currency: 'INR' },
    { city: mumbai._id, vehicleType: 'auto', baseFare: 21, minimumFare: 21, perKmRate: 13.0, nightSurchargeMultiplier: 1.25, currency: 'INR' },
    { city: mumbai._id, vehicleType: 'taxi', baseFare: 28, minimumFare: 28, perKmRate: 16.0, nightSurchargeMultiplier: 1.20, currency: 'INR' },
    { city: mumbai._id, vehicleType: 'metro', baseFare: 10, minimumFare: 10, perKmRate: 3.0, currency: 'INR' }
  ];

  await FareRule.insertMany(fareRules);
  console.log('💰 Fare rules seeded');
  console.log('🌱 Seeding complete!\n');
  console.log('Credentials:');
  console.log('  Admin: admin@cityroute.in / admin@123');
  console.log('  User:  demo@cityroute.in  / demo@123');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });