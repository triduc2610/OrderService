const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    orderId: { 
        type: String, 
        required: true, 
        unique: true 
    },
    customerName: { 
        type: String, 
        required: true 
    },
    items: { 
        type: [String], 
        required: true 
    },
    totalPrice: { 
        type: Number, 
        default: 0 
    },
    status: { 
        type: String, 
        default: 'PROCESSING' 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Order', OrderSchema);