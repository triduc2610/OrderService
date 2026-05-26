const express = require('express');
const router = express.Router();
const axios = require('axios');
const Order = require('../models/Order');

// API Endpoint: Khách hàng phát động yêu cầu tạo đơn hàng mới
// SỬA TẠI ĐÂY: Đổi từ '/create' thành '/' để đồng bộ 100% với file app.js của Frontend
router.post('/create', async (req, res) => {
    const { orderId, customerName, items, totalPrice } = req.body;

    try {
        //  BƯỚC 1: XỬ LÝ NỘI BỘ (Lưu đơn hàng vào DB riêng của Order Service)
        const newOrder = new Order({
            orderId,
            customerName,
            items,
            totalPrice
        });
        await newOrder.save();
        console.log(`📦 [Order Service]: Đã ghi nhận và lưu thành công hóa đơn ${orderId} vào DB.`);

        // BƯỚC 2: GIAO TIẾP LIÊN DỊCH VỤ ĐỒNG BỘ (Bọc khối try-catch cô lập để chống lỗi sập dây chuyền)
        try {
            const trackingServiceUrl = 'http://localhost:5001/api/tracking/init';
            
            // Nếu bạn chưa kịp viết API "/init" bên phía Tracking Service, lệnh này sẽ bị lỗi, 
            // nhưng nhờ khối try-catch này, app của bạn sẽ không nhảy xuống lỗi 500 tổng.
            await axios.post(trackingServiceUrl, {
                orderId: orderId,
                status: "Đang chế biến"
            }, { timeout: 4000 }); // Cài đặt timeout 4 giây quá hạn tự ngắt để tránh treo server
            
            console.log(`[Order Service]: Đồng bộ dữ liệu sang Tracking Service thành công cho đơn: ${orderId}`);
        } catch (axiosError) {
            console.warn(`⚠️ [Order Service - Cảnh báo giao tiếp]: Không thể đồng bộ trạng thái ban đầu sang Tracking Service. Lý do: ${axiosError.message}`);
            // Chúng ta chỉ ghi log cảnh báo chứ không chặn luồng của khách hàng
        }

        // BƯỚC 3: PHẢN HỒI KẾT QUẢ VỀ CHO FRONTEND APP.JS
        return res.status(201).json({
            success: true,
            message: "Đơn hàng đã được khởi tạo thành công tại hệ thống!",
            orderId: newOrder.orderId, // Trả thêm mã này để FrontEnd bẫy điều kiện data.orderId hoạt động tốt
            data: newOrder
        });

    } catch (error) {
        console.error("❌ [Order Service Lỗi Luồng]: Khởi tạo đơn hàng thất bại hoàn toàn:", error.message);
        
        return res.status(500).json({ 
            success: false, 
            error: "Hệ thống lỗi không thể khởi tạo đơn hàng vào cơ sở dữ liệu.",
            details: error.message 
        });
    }
});

module.exports = router;