// fares.js
const express = require('express');
const router = express.Router();
const c = require('../controllers/fareController');
const { protect, requireAdmin } = require('../middleware/auth');

router.get('/', c.getFareRules);
router.get('/:id', c.getFareRule);
router.post('/', protect, requireAdmin, c.createFareRule);
router.put('/:id', protect, requireAdmin, c.updateFareRule);
router.delete('/:id', protect, requireAdmin, c.deleteFareRule);

module.exports = router;