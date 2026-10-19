require('dotenv').config();
const app = require('./app');
const { startGrpcServer } = require('./interfaces/grpc/customer.grpc');

const PORT = process.env.PORT || 3002;
const GRPC_PORT = process.env.GRPC_PORT || 50051;

app.listen(PORT, () => {
  console.log(`Customer REST Service đang chạy tại port ${PORT}`);
});

startGrpcServer(GRPC_PORT);
