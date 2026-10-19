const { ObjectId } = require('mongodb');
const { getDB } = require('../../infrastructure/db');

// 1. T?o m?i s?n ph?m (m?u)
const createProduct = async (req, res) => {
  try {
    const { name, price, stock, description } = req.body;
    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({ message: 'name, price và stock là bắt buộc' });
    }

    const db = getDB();
    const result = await db.collection('products').insertOne({
      name,
      price: Number(price),
      stock: Number(stock),
      description: description || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return res.status(201).json({
      message: 'Tạo sản phẩm thành công',
      data: { _id: result.insertedId, name, price, stock, description }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// 2. Lấy danh sách sản phẩm
const getProducts = async (req, res) => {
  try {
    const db = getDB();
    const products = await db.collection('products').find({}).toArray();
    return res.status(200).json({ data: products });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// 3. Lấy chi tiết sản phẩm theo ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    const db = getDB();
    const product = await db.collection('products').findOne({ _id: new ObjectId(id) });
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    return res.status(200).json({ data: product });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// 4. Kiểm tra tồn kho
const checkStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.query;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    const db = getDB();
    const product = await db.collection('products').findOne({ _id: new ObjectId(id) });
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    const reqQty = Number(quantity) || 1;
    const isAvailable = product.stock >= reqQty;

    return res.status(200).json({
      available: isAvailable,
      currentStock: product.stock,
      requestedQuantity: reqQty
    });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// 5. Cập nhật số lượng tồn kho
const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stockDelta } = req.body; // Duong: tang t?n kho,m: gi?m t?n kho

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    const db = getDB();
    const product = await db.collection('products').findOne({ _id: new ObjectId(id) });
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    const newStock = product.stock + Number(stockDelta);
    if (newStock < 0) {
      return res.status(400).json({ message: 'Tồn kho không đủ để thực hiện thao tác này' });
    }

    await db.collection('products').updateOne(
      { _id: new ObjectId(id) },
      { $set: { stock: newStock, updatedAt: new Date() } }
    );

    return res.status(200).json({
      message: 'Cập nhật tồn kho thành công',
      previousStock: product.stock,
      currentStock: newStock
    });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  checkStock,
  updateStock,
};
