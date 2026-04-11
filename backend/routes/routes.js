const express = require('express');
const router = express.Router();
const { estimateRoute, compareRoutes, autocomplete } = require('../controllers/routeController');
const { optionalAuth } = require('../middleware/auth');

router.post('/estimate', optionalAuth, estimateRoute);
router.post('/compare', optionalAuth, compareRoutes);
router.get('/autocomplete', autocomplete);

module.exports = router;