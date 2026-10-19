const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'order-service',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
});

const producer = kafka.producer();

const connectProducer = async () => {
  try {
    await producer.connect();
    console.log(' Order Service kết nối Kafka Producer thành công');
  } catch (error) {
    console.error('Lỗi kết nối Kafka Producer:', error.message);
  }
};

module.exports = { kafka, producer, connectProducer };