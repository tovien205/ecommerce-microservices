const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://admin:admin_password@localhost:27017/product_db?authSource=admin';
const client = new MongoClient(uri);

let db;

const connectDB = async () => {
  if (db) return db;
  try {
    await client.connect();
    console.log('?? K?t n?i MongoDB (product_db) thành công');
    db = client.db();
    return db;
  } catch (error) {
    console.error('L?i k?t n?i MongoDB:', error);
    process.exit(1);
  }
};

const getDB = () => {
  if (!db) throw new Error('Database chua duoc khoi tao. Hay goi connectDB truoc.');
  return db;
};

module.exports = { connectDB, getDB };
