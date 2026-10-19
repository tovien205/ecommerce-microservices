const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = path.resolve(__dirname, '../../../../../shared/proto/customer.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const customerProto = grpc.loadPackageDefinition(packageDefinition).customer;
const host = process.env.CUSTOMER_GRPC_HOST || 'localhost:50051';
const client = new customerProto.CustomerService(host, grpc.credentials.createInsecure());

const getCustomer = (customerId) => {
  return new Promise((resolve, reject) => {
    client.GetCustomer({ customerId }, (err, response) => {
      if (err) return reject(err);
      resolve(response);
    });
  });
};

module.exports = { getCustomer };
