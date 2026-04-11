const express = require('express');
const router = express.Router();
const { getHistory, deleteHistory } = require('../controllers/historyController');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getHistory);
router.delete('/:id', protect, deleteHistory);

module.exports = router;