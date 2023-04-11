const mongoose = require('mongoose');
const User= require('./userModel');

const orderSchema = new mongoose.Schema({
    // Connecting User with Order using refferencing
    customerID: { 
        type: mongoose.Schema.ObjectId,
        ref: 'User', 
        required: [true, 'Order must belongs to a User']
    },
    items: { 
        type: Object, 
        required: [true, 'Order must have item']
    },
    phone: { 
        type: String, 
        required: [true, 'User must provide phone number'],
        match: [/^(\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/, 'Phone number is not in correct fromat']
    },
    address: {
        type: String,
        required: [true, 'User must provide order address'],
    },
    paymentType: { 
        type: String, 
        enum: ['COD', 'online'],
        default: 'COD'
    },
    status: { 
        type: String, 
        enum: ['order_placed', 'confirmed', 'prepared', 'delivered', 'completed', 'cancelled', 'refunded', 'reject-refund'],
        default: 'order_placed'
    },
    paymentStatus: {
        type: String
    }
}, {timestamps: true});


const Order = mongoose.model('Order', orderSchema);

module.exports= Order;