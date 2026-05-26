const mongoose = require('mongoose');

const connectOrderDB = async () => {
    try {
        // Lấy URI từ biến môi trường Cloud, nếu không có sẽ tự fallback về DB local để test
        const mongoURI = process.env.MONGO_ORDER_URI || 'mongodb://localhost:27017/order_service_db';
        
        // Làm sạch ký tự khoảng trắng ẩn nếu có do quá trình Copy-Paste trên Render
        await mongoose.connect(mongoURI.trim(), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('📝 [MongoDB - Order Service]: Thiết lập kết nối thành công tới Database Đơn hàng!');
    } catch (error) {
        console.error('❌ [MongoDB - Order Service Error]: Kết nối cơ sở dữ liệu thất bại:', error.message);
        process.exit(1); // Ngắt tiến trình lập tức nếu lỗi DB để Render báo trạng thái kiểm tra
    }
};

module.exports = connectOrderDB;