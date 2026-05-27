require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectOrderDB = require('./config/database');
const orderRoutes = require('./src/routes/orderRoutes');

const app = express();

//cors allow fe to place order
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST']
}));
app.use(express.json());

//API orders
app.use('/api/orders', orderRoutes);

app.get('/ping', (req, res) => {
    return res.json({ service: "order_service", status: "alive", timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        console.log('Đang thiết lập kết nối tới MongoDB Atlas');
        
        await connectOrderDB();
        
        app.listen(PORT, () => {
            console.log(`[ORDER SERVICE LIVE]: DỊCH VỤ ĐƠN HÀNG ĐANG VẬN HÀNH ỔN ĐỊNH TẠI CỔNG: ${PORT}`);
        });
    } catch (error) {
        console.error('[System Crash]: Khởi động Order Service thất bại:', error.message);
        process.exit(1);
    }
};
startServer();