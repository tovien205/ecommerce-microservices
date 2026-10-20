const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI || 
            process.env.SHIPMENT_MONGO_URI || 
            process.env.MONGODB_URI || 
            'mongodb://app_user:change_me@ecommerce-mongodb:27017/shipment_db?authSource=admin';

const client = new MongoClient(uri);

let db;

const connectDB = async () => {
  if (db) return db;
  try {
    await client.connect();
    console.log('✅ Kết nối MongoDB (shipment_db) thành công');
    db = client.db();

    // Tạo Unique Index cho orderId để tránh tạo trùng Shipment
    await db.collection('shipments').createIndex({ orderId: 1 }, { unique: true });
    
    return db;
  } catch (error) {
    console.error('❌ Lỗi kết nối MongoDB:', error.message);
    process.exit(1);
  }
};

const getDB = () => {
  if (!db) throw new Error('Database chưa được khởi tạo.');
  return db;
};

module.exports = { connectDB, getDB };