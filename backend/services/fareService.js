/**
 * Fare Calculation Service
 * Computes fare based on distance, vehicle type, city rules, time of day.
 */

const FareRule = require('../models/FareRule');

class FareService {
  /**
   * Get fare rule for a city + vehicle combination.
   */
  async getFareRule(cityId, vehicleType) {
    return FareRule.findOne({ city: cityId, vehicleType, isActive: true });
  }

  /**
   * Check if current time falls in night surcharge window.
   */
  isNightTime(rule) {
    const hour = new Date().getHours();
    if (rule.nightStartHour > rule.nightEndHour) {
      // crosses midnight: e.g. 23 to 6
      return hour >= rule.nightStartHour || hour < rule.nightEndHour;
    }
    return hour >= rule.nightStartHour && hour < rule.nightEndHour;
  }

  /**
   * Calculate fare given distance and fare rule.
   */
  calculateFare(distanceKm, rule, applyNightSurcharge = null) {
    if (!rule) {
      return { error: 'No fare rule available for this vehicle in this city.' };
    }

    let distanceCharge = 0;

    // Slab-based calculation (if slabs defined)
    if (rule.slabs && rule.slabs.length > 0) {
      let remaining = distanceKm;
      const sortedSlabs = [...rule.slabs].sort((a, b) => a.upToKm - b.upToKm);
      let lastKm = 0;

      for (const slab of sortedSlabs) {
        if (remaining <= 0) break;
        const slabKm = Math.min(remaining, slab.upToKm - lastKm);
        distanceCharge += slabKm * slab.ratePerKm;
        remaining -= slabKm;
        lastKm = slab.upToKm;
      }

      // Remaining distance beyond last slab
      if (remaining > 0) {
        distanceCharge += remaining * rule.perKmRate;
      }
    } else {
      distanceCharge = distanceKm * rule.perKmRate;
    }

    const baseFare = rule.baseFare || 0;
    let subtotal = baseFare + distanceCharge;

    // Night surcharge
    const isNight = applyNightSurcharge !== null ? applyNightSurcharge : this.isNightTime(rule);
    let nightSurcharge = 0;
    if (isNight && rule.nightSurchargeMultiplier > 1.0) {
      nightSurcharge = subtotal * (rule.nightSurchargeMultiplier - 1.0);
      subtotal += nightSurcharge;
    }

    const total = Math.max(subtotal, rule.minimumFare);

    return {
      baseFare: parseFloat(baseFare.toFixed(2)),
      distanceCharge: parseFloat(distanceCharge.toFixed(2)),
      nightSurcharge: parseFloat(nightSurcharge.toFixed(2)),
      subtotal: parseFloat(subtotal.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      minimumFareApplied: total === rule.minimumFare && subtotal < rule.minimumFare,
      isNightTime: isNight,
      currency: rule.currency || 'INR'
    };
  }

  /**
   * Calculate fare for all supported vehicles in a city.
   */
  async compareAllVehicles(cityId, distanceKm, supportedVehicles = ['bus', 'auto', 'taxi', 'metro']) {
    const rules = await FareRule.find({
      city: cityId,
      vehicleType: { $in: supportedVehicles },
      isActive: true
    });

    const comparison = {};
    for (const rule of rules) {
      comparison[rule.vehicleType] = this.calculateFare(distanceKm, rule);
    }
    return comparison;
  }

  /**
   * Estimate travel duration with traffic factor (future: replace with real traffic API).
   */
  applyTrafficFactor(baseDurationMin, vehicleType, hour = null) {
    const currentHour = hour !== null ? hour : new Date().getHours();

    // Peak hours: 8-10, 17-20
    const isPeak = (currentHour >= 8 && currentHour <= 10) || (currentHour >= 17 && currentHour <= 20);

    const trafficMultipliers = {
      bus: isPeak ? 1.4 : 1.1,
      auto: isPeak ? 1.3 : 1.05,
      taxi: isPeak ? 1.3 : 1.0,
      metro: 1.0 // Metro unaffected by traffic
    };

    const multiplier = trafficMultipliers[vehicleType] || 1.1;
    return Math.round(baseDurationMin * multiplier);
  }
}

module.exports = new FareService();