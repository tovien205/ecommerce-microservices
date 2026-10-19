require('dotenv').config();
const { connectDB } = require('./infrastructure/db');
const app = require('./app');
const { startGrpcServer } = require('./interfaces/grpc/product.grpc');

const PORT = process.env.PORT || 3003;
const GRPC_PORT = process.env.GRPC_PORT || 50052;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(` Product REST Service dang chay tai port ${PORT}`);
  });

  startGrpcServer(GRPC_PORT);
};

startServer();
