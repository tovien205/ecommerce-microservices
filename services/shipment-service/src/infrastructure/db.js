const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://admin:admin_password@localhost:27017/shipment_db?authSource=admin';
const client = new MongoClient(uri);

let db;

const connectDB = async () => {
  if (db) return db;
  try {
    await client.connect();
    console.log('?? K?t n?i MongoDB (shipment_db) thành công');
    db = client.db();

    // Tạo Unique Index cho orderId để tránh tạo trùng Shipment khi nhận lại cùng sự kiện
    await db.collection('shipments').createIndex({ orderId: 1 }, { unique: true });
    
    return db;
  } catch (error) {
    console.error('Lỗi kết nối MongoDB:', error.message);
    process.exit(1);
  }
};

const getDB = () => {
  if (!db) throw new Error('Database chưa được khởi tạo.');
  return db;
};

module.exports = { connectDB, getDB };
