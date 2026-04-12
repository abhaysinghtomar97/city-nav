const express = require('express');
const router = express.Router();
const routController = require('../controllers/routeController');
const { optionalAuth } = require('../middleware/auth');
console.log("rout: ",routController);
router.post('/estimate', optionalAuth, routController.estimateRoute);
router.post('/compare', optionalAuth, routController.compareRoutes);
router.get('/autocomplete', routController.autocomplete);

module.exports = router;