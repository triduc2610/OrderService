const express = require('express');
const router = express.Router();
const axios = require('axios');
const Order = require('../models/Order');

// API Endpoint
router.post('/', async (req, res) => {
    const { orderId, customerName, items, totalPrice } = req.body;

    try {
        //Take new order
        const newOrder = new Order({
            orderId,
            customerName,
            items,
            totalPrice
        });
        await newOrder.save();
        console.log(`[Order Service]: Da ghi nhan va luu thanh cong hoa don ${orderId} vao DB.`);

        try {
            const isLocal = process.env.NODE_ENV !== 'production' && !process.env.RENDER;
            const trackingServiceUrl = isLocal
                ? 'http://localhost:5001/api/tracking/init'
                : 'https://trackingservice-d6bf.onrender.com/api/tracking/init';
            
            console.log(`[Inter-service]: Dang dong bo sang Tracking Service qua URL: ${trackingServiceUrl}`);

            // Call HTTP POST to Tracking Service
            await axios.post(trackingServiceUrl, {
                orderId: orderId,
                status: "Dang che bien"
            }, { timeout: 4000 });
            
            console.log(`[Order Service]: Dong bo du lieu sang Tracking Service thanh cong cho don: ${orderId}`);
        } catch (axiosError) {
            console.warn(`[Order Service - Canh bao giao tiep]: Khong the dong bo trang thai ban dau sang Tracking Service. Ly do: ${axiosError.message}`);
        }

        // Return to fe
        return res.status(201).json({
            success: true,
            message: "Don hang da duoc khoi tao thanh cong tai he thong!",
            orderId: newOrder.orderId, 
            data: newOrder
        });

    } catch (error) {
        console.error("[Order Service Error]: Luong xu ly don that bai hoan toan:", error.message);
        
        return res.status(500).json({ 
            success: false, 
            error: "He thong phan tan gap su co trong qua trinh phoi hop lien dich vu.",
            details: error.response ? error.response.data : error.message 
        });
    }
});

module.exports = router;