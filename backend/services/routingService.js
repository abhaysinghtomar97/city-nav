/**
 * Graph-based routing service using Dijkstra's algorithm.
 * Works with the RouteEdge collection to find shortest paths between locations.
 */

const RouteEdge = require('../models/RouteEdge');
const Location = require('../models/Location');

class RoutingService {
  /**
   * Build adjacency list from RouteEdge documents for a given city and vehicle type.
   */
  async buildGraph(cityId, vehicleType) {
    const query = { city: cityId, isActive: true };
    if (vehicleType && vehicleType !== 'all') {
      query.supportedVehicles = vehicleType;
    }

    const edges = await RouteEdge.find(query)
      .populate('from', 'name coordinates')
      .populate('to', 'name coordinates');

    const graph = {}; // adjacency list

    for (const edge of edges) {
      const fromId = edge.from._id.toString();
      const toId = edge.to._id.toString();

      if (!graph[fromId]) graph[fromId] = [];
      if (!graph[toId]) graph[toId] = [];

      graph[fromId].push({
        nodeId: toId,
        nodeName: edge.to.name,
        distanceKm: edge.distanceKm,
        durationMinutes: edge.durationMinutes,
        edgeId: edge._id.toString()
      });

      if (edge.isBidirectional) {
        graph[toId].push({
          nodeId: fromId,
          nodeName: edge.from.name,
          distanceKm: edge.distanceKm,
          durationMinutes: edge.durationMinutes,
          edgeId: edge._id.toString()
        });
      }
    }

    return { graph };
  }

  /**
   * Dijkstra's algorithm for shortest path by distance.
   */
  dijkstra(graph, sourceId, destinationId, locationMap) {
    const distances = {};
    const durations = {};
    const previous = {};
    const visited = new Set();
    const steps = {};

    for (const nodeId in graph) {
      distances[nodeId] = Infinity;
      durations[nodeId] = Infinity;
      previous[nodeId] = null;
      steps[nodeId] = null;
    }

    distances[sourceId] = 0;
    durations[sourceId] = 0;

    const queue = [{ nodeId: sourceId, dist: 0 }];

    while (queue.length > 0) {
      queue.sort((a, b) => a.dist - b.dist);
      const { nodeId: current } = queue.shift();

      if (visited.has(current)) continue;
      if (current === destinationId) break;

      visited.add(current);

      const neighbors = graph[current] || [];

      for (const neighbor of neighbors) {
        if (visited.has(neighbor.nodeId)) continue;

        const newDist = distances[current] + neighbor.distanceKm;

        if (newDist < distances[neighbor.nodeId]) {
          distances[neighbor.nodeId] = newDist;
          durations[neighbor.nodeId] =
            durations[current] + neighbor.durationMinutes;

          previous[neighbor.nodeId] = current;

          steps[neighbor.nodeId] = {
            from: locationMap[current]?.name || current,
            to: neighbor.nodeName,
            distanceKm: neighbor.distanceKm,
            durationMin: neighbor.durationMinutes
          };

          queue.push({ nodeId: neighbor.nodeId, dist: newDist });
        }
      }
    }

    if (distances[destinationId] === Infinity) return null;

    const path = [];
    const pathSteps = [];

    let current = destinationId;

    while (current !== null) {
      path.unshift(
        locationMap[current] || {
          name: current,
          lat: null,
          lng: null
        }
      );

      if (steps[current]) pathSteps.unshift(steps[current]);

      current = previous[current];
    }

    return {
      path,
      steps: pathSteps,
      totalDistanceKm: parseFloat(distances[destinationId].toFixed(2)),
      totalDurationMin: Math.round(durations[destinationId])
    };
  }

  /**
   * Main route estimation function.
   */
  async estimateRoute(cityId, sourceId, destinationId, vehicleType) {
    const startTime = Date.now();

    const { graph } = await this.buildGraph(cityId, vehicleType);

    // 🔥 IMPORTANT FIX: include coordinates
    const allLocations = await Location.find({
      city: cityId,
      isActive: true
    }).select('name coordinates');

    const locationMap = {};

    for (const loc of allLocations) {
      locationMap[loc._id.toString()] = {
        name: loc.name,
        lat: loc.coordinates && loc.coordinates.lat ? loc.coordinates.lat : null,
        lng: loc.coordinates && loc.coordinates.lng ? loc.coordinates.lng : null
      };
    }

    const sourceStr = sourceId.toString();
    const destStr = destinationId.toString();

    if (!graph[sourceStr]) graph[sourceStr] = [];
    if (!graph[destStr]) graph[destStr] = [];

    const result = this.dijkstra(graph, sourceStr, destStr, locationMap);

    const queryDurationMs = Date.now() - startTime;

    return result ? { ...result, queryDurationMs } : null;
  }
}

module.exports = new RoutingService();