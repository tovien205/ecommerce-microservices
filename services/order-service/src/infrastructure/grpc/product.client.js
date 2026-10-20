const path = require('path');
const fs = require('fs');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Load file proto an toàn cho môi trường Docker Container
const PROTO_PATH = path.resolve(__dirname, '../../../../../shared/proto/product.proto');
const ALTERNATE_PROTO_PATH = path.resolve(process.cwd(), 'shared/proto/product.proto');

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

const productProto = grpc.loadPackageDefinition(packageDefinition).product;

// Ưu tiên đọc PRODUCT_GRPC_URL đúng tên khai báo trong docker-compose.yml
let host = process.env.PRODUCT_GRPC_URL || process.env.PRODUCT_GRPC_HOST || 'product-service:50052';

// Ép kiểu nếu lỡ bị dính localhost / 127.0.0.1 / ::1
if (host.includes('localhost') || host.includes('127.0.0.1') || host.includes('::1')) {
  host = 'product-service:50052';
}

const client = new productProto.ProductService(host, grpc.credentials.createInsecure());

const getProduct = (id) => {
  return new Promise((resolve, reject) => {
    const deadline = new Date(Date.now() + 3000);
    client.GetProduct({ id }, { deadline }, (err, response) => {
      if (err) return reject(err);
      resolve(response);
    });
  });
};

const reserveStock = (id, quantity) => {
  return new Promise((resolve, reject) => {
    const deadline = new Date(Date.now() + 3000);
    client.ReserveStock({ id, quantity }, { deadline }, (err, response) => {
      if (err) return reject(err);
      resolve(response);
    });
  });
};

module.exports = { getProduct, reserveStock };