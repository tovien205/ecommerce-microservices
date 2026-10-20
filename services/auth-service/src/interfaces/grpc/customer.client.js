const path = require('path');
const fs = require('fs');

let client = null;

try {
  const grpc = require('@grpc/grpc-js');
  const protoLoader = require('@grpc/proto-loader');

  const protoPath = fs.existsSync('/shared/proto/customer.proto')
    ? '/shared/proto/customer.proto'
    : path.resolve(__dirname, '../../../../shared/proto/customer.proto');

  if (fs.existsSync(protoPath)) {
    const packageDefinition = protoLoader.loadSync(protoPath, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const customerProto = grpc.loadPackageDefinition(packageDefinition).customer;
    const host = process.env.CUSTOMER_GRPC_HOST || 'customer-service:50051';

    client = new customerProto.CustomerService(host, grpc.credentials.createInsecure());
  }
} catch (err) {
  console.error('[gRPC Client Init Error]:', err.message);
}

const createCustomer = (customerData) => {
  return new Promise((resolve) => {
    if (!client) return resolve(null);
    const deadline = new Date(Date.now() + 3000);
    client.CreateCustomer(customerData, { deadline }, (err, response) => {
      if (err) return resolve(null);
      resolve(response);
    });
  });
};

module.exports = { createCustomer };