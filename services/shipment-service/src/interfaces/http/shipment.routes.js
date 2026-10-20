const express = require('express');
const router = express.Router();
const {
  getShipments,
  getShipmentById,
  getShipmentByOrderId,
  updateShipmentStatus,
} = require('./shipment.controller');

router.get('/', getShipments);
router.get('/order/:orderId', getShipmentByOrderId);
router.get('/:id', getShipmentById);
router.put('/:id/status', updateShipmentStatus);

module.exports = router;