const express = require('express');
const router = express.Router();
const axios = require('axios');
const Order = require('../models/Order');

// API Endpoint: Khách hàng phát động yêu cầu tạo đơn hàng mới
// 👉 ĐÃ SỬA: Đổi từ '/create' thành '/' để khớp hoàn toàn với URL cấu hình ở Frontend app.js
router.post('/', async (req, res) => {
    const { orderId, customerName, items, totalPrice } = req.body;

    try {
        // 📦 BƯỚC 1: XỬ LÝ NỘI BỘ (Lưu đơn hàng vào DB riêng của Order Service)
        const newOrder = new Order({
            orderId,
            customerName,
            items,
            totalPrice
        });
        await newOrder.save();
        console.log(`📦 [Order Service]: Đã ghi nhận và lưu thành công hóa đơn ${orderId} vào DB.`);

        // 📡 BƯỚC 2: GIAO TIẾP LIÊN DỊCH VỤ ĐỒNG BỘ (Bọc khối try-catch cô lập để chống lỗi sập dây chuyền)
        try {
            // 👉 ĐÃ SỬA: Tự động nhận diện môi trường để gọi link Cloud Render hoặc Localhost chính xác
            const isLocal = process.env.NODE_ENV !== 'production' && !process.env.RENDER;
            const trackingServiceUrl = isLocal
                ? 'http://localhost:5001/api/tracking/init'
                : 'https://trackingservice-d6bf.onrender.com/api/tracking/init';
            
            console.log(`📡 [Inter-service]: Đang đồng bộ sang Tracking Service qua URL: ${trackingServiceUrl}`);

            // Thực hiện gọi HTTP POST sang Tracking Service, cấu hình ngắt đuôi sau 4 giây để tránh treo luồng
            await axios.post(trackingServiceUrl, {
                orderId: orderId,
                status: "Đang chế biến"
            }, { timeout: 4000 });
            
            console.log(`[Order Service]: Đồng bộ dữ liệu sang Tracking Service thành công cho đơn: ${orderId}`);
        } catch (axiosError) {
            // Nếu Tracking Service lỗi hoặc chưa bật, luồng chính của khách hàng vẫn được tiếp tục
            console.warn(`⚠️ [Order Service - Cảnh báo giao tiếp]: Không thể đồng bộ trạng thái ban đầu sang Tracking Service. Lý do: ${axiosError.message}`);
        }

        // 🎯 BƯỚC 3: PHẢN HỒI KẾT QUẢ VỀ CHO FRONTEND APP.JS
        return res.status(201).json({
            success: true,
            message: "Đơn hàng đã được khởi tạo thành công tại hệ thống!",
            orderId: newOrder.orderId, // Giúp Frontend bẫy điều kiện data.orderId hoạt động mượt mà
            data: newOrder
        });

    } catch (error) {
        console.error("❌ [Order Service Error]: Luồng xử lý đơn thất bại hoàn toàn:", error.message);
        
        // Luôn luôn bảo đảm cấu trúc JSON sạch sẽ trả về cho Client
        return res.status(500).json({ 
            success: false, 
            error: "Hệ thống phân tán gặp sự cố trong quá trình phối hợp liên dịch vụ.",
            details: error.response ? error.response.data : error.message 
        });
    }
});

module.exports = router;