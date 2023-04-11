const mongoose= require('mongoose');

const paymentDetailsSchema = new mongoose.Schema({
	orderID: { // created by razorpay during order creation
		type: String,
		required: true
	},
	receiptID: { // auto generated unique payment recieptID (generated using 'nanoid' package)
		type: String
	},
	paymentID: { // created by razorpay during payment
		type: String,
	},
	signature: { // also created by razorpay
		type: String,
	},
    customerID: {  // ID of the customer who is ordering this
        type: String,
    },
    productOrderID: { // ID of the product (food)
        type: String,
    },
	amount: {
		type: Number
	},
	currency: {
		type: String,
        default: "INR"
	},
	createdAt: {
		type: Date
	},
	status: { // payment status
		type: String
	}
});

module.exports= mongoose.model('PaymentDetail', paymentDetailsSchema);