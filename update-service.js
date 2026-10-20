const fs = require('fs');
const path = require('path');

const services = [
  { path: 'services/auth-service/src/app.js', name: 'auth-service', route: '/api/auth/health' },
  { path: 'services/customer-service/src/app.js', name: 'customer-service', route: '/api/customers/health' },
  { path: 'services/product-service/src/app.js', name: 'product-service', route: '/api/products/health' },
  { path: 'services/order-service/src/app.js', name: 'order-service', route: '/api/orders/health' },
  { path: 'services/shipment-service/src/app.js', name: 'shipment-service', route: '/api/shipments/health' }
];

services.forEach(s => {
  const filePath = path.join(__dirname, s.path);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Xóa route health check cũ nếu có
    content = content.replace(/app\.get\(\['\/health'.*?\);\n?/g, '');
    content = content.replace(/app\.get\('\/health'.*?\);\n?/g, '');

    // Thêm route mảng hỗ trợ cả 2 đường dẫn /health và /api/<service>/health[cite: 17]
    const routeCode = `\napp.get(['/health', '${s.route}'], (req, res) => res.status(200).json({ status: 'ok', service: '${s.name}' }));\n`;

    content = content.replace('const app = express();', 'const app = express();' + routeCode);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Đã cập nhật xong ' + s.name);
  } else {
    console.log('❌ Không tìm thấy file: ' + s.path);
  }
});