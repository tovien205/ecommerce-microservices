const path = require('path');
const fs = require('fs');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const prisma = require('../../infrastructure/prisma');

const PROTO_PATH = path.resolve(__dirname, '../../../../../shared/proto/customer.proto');
const ALTERNATE_PROTO_PATH = path.resolve(process.cwd(), '../shared/proto/customer.proto');

let finalProtoPath = PROTO_PATH;
if (!fs.existsSync(finalProtoPath) && fs.existsSync(ALTERNATE_PROTO_PATH)) {
  finalProtoPath = ALTERNATE_PROTO_PATH;
}

const packageDefinition = protoLoader.loadSync(finalProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const customerProto = grpc.loadPackageDefinition(packageDefinition).customer;

const getCustomerHandler = async (call, callback) => {
  try {
    const { customerId } = call.request;
    // Tra cứu linh hoạt theo id hoặc userId
    const customer = await prisma.customer.findFirst({
      where: {
        OR: [{ id: customerId }, { userId: customerId }],
      },
    });

    if (!customer) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: 'Khách hàng không tồn tại',
      });
    }

    callback(null, {
      id: customer.id,
      userId: customer.userId,
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone || '',
      membershipTier: customer.membershipTier || 'SILVER',
      score: customer.score || 0,
    });
  } catch (error) {
    callback({
      code: grpc.status.INTERNAL,
      message: error.message,
    });
  }
};

const createCustomerHandler = async (call, callback) => {
  try {
    const { id, userId, fullName, email, phone } = call.request;

    // Dùng upsert để tạo mới hoặc cập nhật nếu đã tồn tại
    const targetId = id || userId;
    const customer = await prisma.customer.upsert({
      where: { id: targetId },
      update: { fullName, email },
      create: {
        id: targetId,
        userId: userId || targetId,
        fullName,
        email,
        phone: phone || '',
      },
    });

    callback(null, {
      id: customer.id,
      userId: customer.userId,
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone || '',
      membershipTier: customer.membershipTier || 'SILVER',
      score: customer.score || 0,
    });
  } catch (error) {
    console.error('[gRPC Customer Server] CreateCustomer error:', error);
    callback({
      code: grpc.status.INTERNAL,
      message: error.message,
    });
  }
};

const startGrpcServer = (port = 50051) => {
  const server = new grpc.Server();
  server.addService(customerProto.CustomerService.service, {
    GetCustomer: getCustomerHandler,
    CreateCustomer: createCustomerHandler,
  });

  server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, boundPort) => {
    if (err) {
      console.error('Lỗi khởi chạy gRPC Server:', err);
      return;
    }
    console.log(`Customer gRPC Service đang chạy tại port ${boundPort}`);
  });
};

module.exports = { startGrpcServer };