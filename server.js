require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectOrderDB = require('./config/database');
const orderRoutes = require('./src/routes/orderRoutes');

const app = express();

// 1. Cấu hình CORS mở toàn cục cho phép Frontend gọi API đặt đơn
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST']
}));
app.use(express.json());

// 2. Khai báo API định tuyến nghiệp vụ Đơn hàng
// Trỏ chính xác vào route '/' bên trong orderRoutes để tạo endpoint: POST http://localhost:5000/api/orders
app.use('/api/orders', orderRoutes);

// 3. Endpoint kiểm tra nhanh trạng thái hoạt động của Service trên Render (Health Check)
app.get('/ping', (req, res) => {
    return res.json({ service: "order_service", status: "alive", timestamp: new Date() });
});

// 4. KIẾN TRÚC KHỞI ĐỘNG TUẦN TỰ AN TOÀN (Sửa lỗi Race Condition)
const PORT = process.env.PORT || 5000; // Khuyên dùng cổng 5000 để phân tách hoàn toàn với 5001 của Tracking Service

const startServer = async () => {
    try {
        console.log('⏳ [System]: Đang thiết lập kết nối tới MongoDB Atlas phân vùng Order...');
        
        // Ép server phải liên kết thành công với cơ sở dữ liệu trước
        await connectOrderDB();
        
        // Khi database đã thông suốt, mới chính thức mở cổng lắng nghe dữ liệu
        app.listen(PORT, () => {
            console.log(`[ORDER SERVICE LIVE]: DỊCH VỤ ĐƠN HÀNG ĐANG VẬN HÀNH ỔN ĐỊNH TẠI CỔNG: ${PORT}`);
        });
    } catch (error) {
        console.error('[System Crash]: Khởi động Order Service thất bại:', error.message);
        process.exit(1);
    }
};

// Kích hoạt tiến trình chạy hệ thống
startServer();