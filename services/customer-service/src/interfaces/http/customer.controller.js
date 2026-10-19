const prisma = require('../../infrastructure/prisma');

const createCustomer = async (req, res) => {
  try {
    const { userId, fullName, email, phone } = req.body;

    if (!userId || !fullName || !email) {
      return res.status(400).json({ message: 'userId, fullName và email là bắt buộc' });
    }

    const existingCustomer = await prisma.customer.findFirst({
      where: { OR: [{ userId }, { email }] }
    });

    if (existingCustomer) {
      return res.status(409).json({ message: 'Khách hàng hoặc email đã tồn tại' });
    }

    const customer = await prisma.customer.create({
      data: { userId, fullName, email, phone: phone || null }
    });

    return res.status(201).json({ message: 'Tạo khách hàng thành công', data: customer });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

const getCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({ where: { id } });

    if (!customer) {
      return res.status(404).json({ message: 'Khách hàng không tồn tại' });
    }

    return res.status(200).json({ data: customer });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

module.exports = { createCustomer, getCustomer };
