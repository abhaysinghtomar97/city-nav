const express = require('express');
const router = express.Router();
const c = require('../controllers/locationController');
const { protect, requireAdmin } = require('../middleware/auth');

router.get('/', c.getLocations);
router.get('/:id', c.getLocation);
router.post('/', protect, requireAdmin, c.createLocation);
router.put('/:id', protect, requireAdmin, c.updateLocation);
router.delete('/:id', protect, requireAdmin, c.deleteLocation);

module.exports = router;