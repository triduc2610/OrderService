const express = require('express');
const router = express.Router();
const axios = require('axios');
const Order = require('../models/Order');

// API Endpoint: Khách hàng phát động yêu cầu tạo đơn hàng mới
router.post('/create', async (req, res) => {
    const { orderId, customerName, items, totalPrice } = req.body;

    try {
        // 🚀 BƯỚC 1: XỬ LÝ NỘI BỘ (Lưu đơn hàng vào DB riêng của Order Service)
        const newOrder = new Order({
            orderId,
            customerName,
            items,
            totalPrice
        });
        await newOrder.save();
        console.log(`📦 [Order Service]: Đã ghi nhận và lưu thành công hóa đơn ${orderId} vào DB.`);

        // 📡 BƯỚC 2: GIAO TIẾP LIÊN DỊCH VỤ ĐỒNG BỘ (Inter-service Communication)
        // Phát một HTTP POST request ngầm hướng sang endpoint tiếp nhận hạ tầng của Tracking Service
        const trackingServiceUrl = 'https://trackingservice-d6bf.onrender.com/api/tracking/init';
        
        await axios.post(trackingServiceUrl, {
            orderId: orderId,
            status: "Đang chế biến"
        });
        console.log(`📡 [Order Service]: Đồng bộ dữ liệu sang Tracking Service thành công cho đơn: ${orderId}`);

        // BƯỚC 3: PHẢN HỒI KẾT QUẢ VỀ CHO FRONTEND VERCEL
        res.status(201).json({
            success: true,
            message: "Đơn hàng đã được khởi tạo và đồng bộ liên dịch vụ thành công!",
            data: newOrder
        });

    } catch (error) {
        console.error("❌ [Order Service Lỗi Luồng]: Phân rã tiến trình phân tán thất bại:", error.message);
        
        // Trả về mã lỗi 500 cấu trúc hóa để bẫy lỗi ở Frontend không bị treo màn hình
        res.status(500).json({ 
            success: false, 
            error: "Hệ thống phân tán gặp sự cố trong quá trình phối hợp liên dịch vụ.",
            details: error.message 
        });
    }
});

module.exports = router;