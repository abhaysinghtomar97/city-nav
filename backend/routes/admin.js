const express = require('express');
const router = express.Router();
const c = require('../controllers/adminController');
const { protect, requireAdmin } = require('../middleware/auth');

router.use(protect, requireAdmin);

router.get('/stats', c.getDashboardStats);
router.get('/users', c.getUsers);
router.put('/users/:id/toggle', c.toggleUser);
router.get('/audit-logs', c.getAuditLogs);
router.get('/routes', c.getRouteEdges);
router.post('/routes', c.createRouteEdge);
router.put('/routes/:id', c.updateRouteEdge);
router.delete('/routes/:id', c.deleteRouteEdge);

module.exports = router;