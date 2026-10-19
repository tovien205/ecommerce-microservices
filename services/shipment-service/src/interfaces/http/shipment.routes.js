const express = require('express');
const router = express.Router();
const { getShipments, getShipmentById, updateShipmentStatus } = require('./shipment.controller');

router.get('/', getShipments);
router.get('/:id', getShipmentById);
router.put('/:id/status', updateShipmentStatus);

module.exports = router;
