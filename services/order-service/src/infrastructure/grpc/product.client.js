const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = path.resolve(__dirname, '../../../../../shared/proto/product.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const productProto = grpc.loadPackageDefinition(packageDefinition).product;
const host = process.env.PRODUCT_GRPC_HOST || 'localhost:50052';
const client = new productProto.ProductService(host, grpc.credentials.createInsecure());

const getProduct = (id) => {
  return new Promise((resolve, reject) => {
    client.GetProduct({ id }, (err, response) => {
      if (err) return reject(err);
      resolve(response);
    });
  });
};

const reserveStock = (id, quantity) => {
  return new Promise((resolve, reject) => {
    client.ReserveStock({ id, quantity }, (err, response) => {
      if (err) return reject(err);
      resolve(response);
    });
  });
};

module.exports = { getProduct, reserveStock };
