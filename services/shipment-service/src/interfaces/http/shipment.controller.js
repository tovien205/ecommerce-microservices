const { ObjectId } = require('mongodb');
const { getDB } = require('../../infrastructure/db');

// 1. Lấy tất cả Vận đơn
const getShipments = async (req, res) => {
  try {
    const db = getDB();
    const shipments = await db.collection('shipments').find({}).toArray();
    return res.status(200).json({ data: shipments });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// 2. Tra cứu Vận đơn theo ID hoặc OrderID
const getShipmentById = async (req, res) => {
  try {
    const id = req.params.id || req.params.orderId;
    const db = getDB();

    let query = {};
    if (ObjectId.isValid(id)) {
      query = { _id: new ObjectId(id) };
    } else {
      query = { orderId: id };
    }

    const shipment = await db.collection('shipments').findOne(query);
    if (!shipment) {
      return res.status(404).json({ message: 'Không tìm thấy vận đơn' });
    }

    return res.status(200).json({ data: shipment });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// 3. Cập nhật trạng thái giao hàng
const updateShipmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'SHIPPING', 'DELIVERED', 'CANCELLED'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Trạng thái không hợp lệ. Chỉ chấp nhận: PENDING, SHIPPING, DELIVERED, CANCELLED',
      });
    }

    const db = getDB();
    let query = {};
    if (ObjectId.isValid(id)) {
      query = { _id: new ObjectId(id) };
    } else {
      query = { orderId: id };
    }

    const shipment = await db.collection('shipments').findOne(query);
    if (!shipment) {
      return res.status(404).json({ message: 'Không tìm thấy vận đơn' });
    }

    await db.collection('shipments').updateOne(query, {
      $set: { status, updatedAt: new Date() },
    });

    return res.status(200).json({
      message: 'Cập nhật trạng thái vận đơn thành công',
      data: {
        shipmentId: shipment._id,
        orderId: shipment.orderId,
        previousStatus: shipment.status,
        currentStatus: status,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

module.exports = {
  getShipments,
  getShipmentById,
  getShipmentByOrderId: getShipmentById, // Alias để khớp với route /order/:orderId
  updateShipmentStatus,
};