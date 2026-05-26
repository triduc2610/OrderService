require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectOrderDB = require('./config/database');
const orderRoutes = require('./src/routes/orderRoutes');

const app = express();

// 1. Cấu hình CORS mở toàn cục cho phép Frontend Vercel gọi API đặt đơn
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST']
}));
app.use(express.json());

// 2. Kích hoạt kết nối Cơ sở dữ liệu độc lập của Order Service
connectOrderDB();

// 3. Khai báo API định tuyến nghiệp vụ Đơn hàng
app.use('/api/orders', orderRoutes);

// 4. Endpoint kiểm tra nhanh trạng thái hoạt động của Service trên Render
app.get('/ping', (req, res) => {
    res.json({ service: "order_service", status: "alive", timestamp: new Date() });
});

// 5. Cấu hình cổng mạng thích ứng linh hoạt với hạ tầng đám mây Render
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 [Order Service]: Đang vận hành ổn định tại cổng: ${PORT}`);
});