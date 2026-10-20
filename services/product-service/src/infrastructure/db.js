const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI || 
            process.env.PRODUCT_MONGO_URI || 
            process.env.MONGODB_URI || 
            'mongodb://app_user:change_me@ecommerce-mongodb:27017/product_db?authSource=admin';

const client = new MongoClient(uri);

let db;

const connectDB = async () => {
  if (db) return db;
  try {
    await client.connect();
    console.log('✅ Kết nối MongoDB (product_db) thành công');
    db = client.db();
    return db;
  } catch (error) {
    console.error('❌ Lỗi kết nối MongoDB:', error);
    process.exit(1);
  }
};

const getDB = () => {
  if (!db) throw new Error('Database chưa được khởi tạo. Hãy gọi connectDB trước.');
  return db;
};

module.exports = { connectDB, getDB };