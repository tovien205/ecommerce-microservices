const prisma = require('../../infrastructure/prisma');
const { getCustomer } = require('../../infrastructure/grpc/customer.client');
const { getProduct, reserveStock } = require('../../infrastructure/grpc/product.client');

const createOrder = async (req, res) => {
  try {
    const { customerId, items } = req.body;

    // 1. Kiểm tra dữ liệu đầu vào
    if (!customerId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'customerId và danh sách items là bắt buộc' });
    }

    // 2. Gửi yêu cầu đến Customer Service qua gRPC để lấy thông tin score
    let customerScore = 0;
    try {
      const customer = await getCustomer(customerId);
      customerScore = customer.score || 0;
    } catch (err) {
      return res.status(404).json({ message: 'Khách hàng không tồn tại hoặc lỗi Customer Service', error: err.message });
    }

    // 3. Kiểm tra thông tin sản phẩm & Tồn kho qua gRPC Product Service
    const orderItemsData = [];
    let rawTotalAmount = 0;

    for (const item of items) {
      const product = await getProduct(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Sản phẩm ${item.productId} không tồn tại` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Sản phẩm ${product.name} không đủ tồn kho` });
      }

      const itemTotalPrice = product.price * item.quantity;
      rawTotalAmount += itemTotalPrice;

      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: itemTotalPrice,
      });
    }

    // 4. Tính to�n Discount d?a  Score kh�ch h�ng (M?i 100 score gi?m 1%, t?i da 20%)
    const discountRate = Math.min((customerScore / 100) * 0.01, 0.20);
    const discountAmount = rawTotalAmount * discountRate;
    const finalAmount = rawTotalAmount - discountAmount;

    // 5. Gửi yêu cầu đến Product Service qua gRPC để giảm tồn kho cho từng sản phẩm trong đơn hàng
    for (const item of items) {
      const stockRes = await reserveStock(item.productId, item.quantity);
      if (!stockRes.available) {
        return res.status(400).json({ message: `Không đủ tồn kho cho sản phẩm ID: ${item.productId}` });
      }
    }

    // 6. Thực hiện tạo đơn hàng và ghi OutboxEvent trong cùng một transaction
    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          customerId,
          totalAmount: rawTotalAmount,
          discountAmount,
          finalAmount,
          status: 'COMPLETED',
          items: {
            create: orderItemsData,
          },
        },
        include: { items: true },
      });

      // Ghi OutboxEvent cho OrderCreated
      await tx.outboxEvent.create({
        data: {
          aggregateType: 'Order',
          aggregateId: order.id,
          type: 'OrderCreated',
          payload: {
            orderId: order.id,
            customerId: order.customerId,
            finalAmount: order.finalAmount,
            items: order.items,
          },
        },
      });

      return order;
    });

    return res.status(201).json({
      message: 'Tạo đơn hàng thành công',
      data: newOrder,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    return res.status(200).json({ data: order });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

module.exports = { createOrder, getOrderById };
