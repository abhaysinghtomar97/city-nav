const express = require('express');
const router = express.Router();
const c = require('../controllers/cityController');
const { protect, requireAdmin } = require('../middleware/auth');

router.get('/', c.getCities);
router.get('/:id', c.getCity);
router.post('/', protect, requireAdmin, c.createCity);
router.put('/:id', protect, requireAdmin, c.updateCity);
router.delete('/:id', protect, requireAdmin, c.deleteCity);

module.exports = router;