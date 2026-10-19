const prisma = require('./prisma');
const { producer } = require('./kafka');

const TOPIC_ORDER_CREATED = 'order-created';

const processOutboxEvents = async () => {
  try {
    // 1. Quét danh sách các sự kiện chưa phát (PENDING)
    const pendingEvents = await prisma.outboxEvent.findMany({
      where: { status: 'PENDING' },
      take: 10, // Lấy mỗi lần tối đa 10 sự kiện
      orderBy: { createdAt: 'asc' },
    });

    if (pendingEvents.length === 0) return;

    for (const event of pendingEvents) {
      try {
        // 2. Publish sự kiện lên Kafka
        await producer.send({
          topic: TOPIC_ORDER_CREATED,
          messages: [
            {
              key: event.aggregateId, // orderId làm key phân vùng & định danh
              value: JSON.stringify({
                eventId: event.id, // ID duy nhất để Consumer xử lý trùng (Idempotency)
                type: event.type,
                aggregateType: event.aggregateType,
                aggregateId: event.aggregateId,
                payload: event.payload,
                createdAt: event.createdAt,
              }),
            },
          ],
        });

        // 3. Đánh dấu sự kiện đã gửi thành công
        await prisma.outboxEvent.update({
          where: { id: event.id },
          data: { status: 'PUBLISHED' },
        });

        console.log(` [OutboxWorker] Đã phát sự kiện '${event.type}' (ID: ${event.id}) lên Kafka topic '${TOPIC_ORDER_CREATED}'`);
      } catch (pubErr) {
        console.error(` [OutboxWorker] Lỗi gửi event ID ${event.id} lên Kafka:`, pubErr.message);
      }
    }
  } catch (error) {
    console.error('Lỗi trong Outbox Worker:', error.message);
  }
};

// Chạy Worker lặp lại mỗi 3 giây
const startOutboxWorker = (intervalMs = 3000) => {
  console.log(` Outbox Worker đã khởi chạy (quét mỗi ${intervalMs}ms)...`);
  setInterval(processOutboxEvents, intervalMs);
};

module.exports = { startOutboxWorker };