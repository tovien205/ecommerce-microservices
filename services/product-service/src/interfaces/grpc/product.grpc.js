const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { ObjectId } = require('mongodb');
const { getDB } = require('../../infrastructure/db');

const PROTO_PATH = path.resolve(__dirname, '../../../../../shared/proto/product.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const productProto = grpc.loadPackageDefinition(packageDefinition).product;

const getProductHandler = async (call, callback) => {
  try {
    const { id } = call.request;
    if (!ObjectId.isValid(id)) {
      return callback({ code: grpc.status.INVALID_ARGUMENT, message: 'ID sản phẩm không hợp lệ' });
    }

    const db = getDB();
    const product = await db.collection('products').findOne({ _id: new ObjectId(id) });
    if (!product) {
      return callback({ code: grpc.status.NOT_FOUND, message: 'Sản phẩm không tồn tại' });
    }

    callback(null, {
      id: product._id.toString(),
      name: product.name,
      price: product.price,
      stock: product.stock,
      description: product.description || '',
    });
  } catch (error) {
    callback({ code: grpc.status.INTERNAL, message: error.message });
  }
};

const checkStockHandler = async (call, callback) => {
  try {
    const { id, quantity } = call.request;
    if (!ObjectId.isValid(id)) {
      return callback({ code: grpc.status.INVALID_ARGUMENT, message: 'ID sản phẩm không hợp lệ' });
    }

    const db = getDB();
    const product = await db.collection('products').findOne({ _id: new ObjectId(id) });
    if (!product) {
      return callback({ code: grpc.status.NOT_FOUND, message: 'Sản phẩm không tồn tại' });
    }

    const available = product.stock >= quantity;
    callback(null, {
      available,
      currentStock: product.stock,
      message: available ? 'Có hàng' : 'Tồn kho không đủ',
    });
  } catch (error) {
    callback({ code: grpc.status.INTERNAL, message: error.message });
  }
};

const reserveStockHandler = async (call, callback) => {
  try {
    const { id, quantity } = call.request;
    if (!ObjectId.isValid(id)) {
      return callback({ code: grpc.status.INVALID_ARGUMENT, message: 'ID không hợp lệ' });
    }

    const db = getDB();
    const product = await db.collection('products').findOne({ _id: new ObjectId(id) });
    if (!product) {
      return callback({ code: grpc.status.NOT_FOUND, message: 'Sản phẩm không tồn tại' });
    }

    if (product.stock < quantity) {
      return callback(null, {
        available: false,
        currentStock: product.stock,
        message: 'Không đủ hàng để đặt giá',
      });
    }

    const newStock = product.stock - quantity;
    await db.collection('products').updateOne(
      { _id: new ObjectId(id) },
      { $set: { stock: newStock, updatedAt: new Date() } }
    );

    callback(null, {
      available: true,
      currentStock: newStock,
      message: 'Đặt hàng thành công',
    });
  } catch (error) {
    callback({ code: grpc.status.INTERNAL, message: error.message });
  }
};

const startGrpcServer = (port = 50052) => {
  const server = new grpc.Server();
  server.addService(productProto.ProductService.service, {
    GetProduct: getProductHandler,
    CheckStock: checkStockHandler,
    ReserveStock: reserveStockHandler,
  });

  server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, boundPort) => {
    if (err) {
      console.error('Lỗi khi khởi chạy gRPC Server:', err);
      return;
    }
    console.log(`Product gRPC Service đang chạy tại port ${boundPort}`);
  });
};

module.exports = { startGrpcServer };
