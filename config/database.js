const mongoose = require('mongoose');

const connectOrderDB = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://trduc261005_db_user:triduc2610!@trackingservice.ybrjrd8.mongodb.net/OrderService?appName=OrderService';
        
        await mongoose.connect(MONGO_URI.trim());
        
        console.log('[MongoDB - Order Service]: Thiết lập kết nối thành công tới Database Đơn hàng!');
    } catch (error) {
        console.error('[MongoDB - Order Service Error]: Kết nối cơ sở dữ liệu thất bại:', error.message);
        process.exit(1);
    }
};

module.exports = connectOrderDB;