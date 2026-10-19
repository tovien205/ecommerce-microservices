const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const prisma = require('../../infrastructure/prisma');

// Sửa lại thành 5 lần lùi ../
const PROTO_PATH = path.resolve(__dirname, '../../../../../shared/proto/customer.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
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
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });

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
      membershipTier: customer.membershipTier,
      score: customer.score,
    });
  } catch (error) {
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
