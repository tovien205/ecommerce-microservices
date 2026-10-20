const { Kafka } = require('kafkajs');
const { getDB } = require('./db');

const kafka = new Kafka({
  clientId: 'shipment-service',
  brokers: (process.env.KAFKA_BROKERS || 'kafka:9092').split(','),
});

const consumer = kafka.consumer({ groupId: 'shipment-group' });

const startKafkaConsumer = async () => {
  try {
    await consumer.connect();
    console.log('✅ Shipment Service kết nối Kafka Consumer thành công');

    await consumer.subscribe({ topic: 'order-created', fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const event = JSON.parse(message.value.toString());
          console.log(`📦 [Kafka Consumer] Nhận sự kiện '${event.type}' (Event ID: ${event.eventId || 'N/A'})`);

          if (event.type === 'OrderCreated' || event.payload) {
            const { orderId, customerId, items, finalAmount } = event.payload;

            if (!orderId) {
              console.warn('Dữ liệu sự kiện không hợp lệ: Thiếu orderId');
              return;
            }

            const db = getDB();

            // Chống xử lý trùng (Idempotency check)
            const existingShipment = await db.collection('shipments').findOne({ orderId });
            if (existingShipment) {
              console.log(`⚠️ Shipment cho OrderID '${orderId}' đã tồn tại. Bỏ qua xử lý trùng.`);
              return;
            }

            // Tạo Shipment mới với trạng thái PENDING
            const newShipment = {
              orderId,
              customerId,
              items: items || [],
              totalAmount: finalAmount || 0,
              status: 'PENDING',
              trackingCode: `TRK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            await db.collection('shipments').insertOne(newShipment);
            console.log(`🚀 [Shipment Created] Đã tạo vận đơn mới thành công cho Order '${orderId}' (Tracking: ${newShipment.trackingCode})`);
          }
        } catch (msgErr) {
          if (msgErr.code === 11000) {
            console.log('⚠️ Bỏ qua tạo trùng vận đơn (MongoDB Unique Constraint)');
          } else {
            console.error('Lỗi xử lý message Kafka:', msgErr.message);
          }
        }
      },
    });
  } catch (error) {
    console.error('Lỗi khởi chạy Kafka Consumer:', error.message);
  }
};

module.exports = { startKafkaConsumer };