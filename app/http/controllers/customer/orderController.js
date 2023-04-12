
const Order= require('../../../models/orderModel');
const moment= require('moment'); // This JS library is used to format date and time nicely

// create order wala function is shifted to onlinePaymentController.createOrder

exports.fetchCustomerOrder= async (req, res) => {
    // This can access user info from req.user
    // This can access session info from req.session
    // Order address and phoneNumber are in req.body

    try{
        let query= Order.find({ customerID: req.user._id });
        query= query.sort('-createdAt');
        const orders= await query;

        res.status(200).render('customers/order', {
             orders: orders ,
             moment: moment // we are sending whole library to front-end 😂 (in order to format dates)
        });

    } catch (err) {
        res.status(404).render('error', {
            message: "Can't fetch your orders :("
        });
    }
}


exports.fetchCustomerSingleOrder= async (req, res) => {
    try{
        const order= await Order.findById(req.params.orderID);

        if(!order){
            throw new Error("Can't find order.. ");
        }

        if(req.user._id.toString() !== order.customerID.toString()){ // if userID is not matched with order's customerID
            throw new Error("You are not allowed to view other user's orders");
        }

        res.status(200).render('customers/singleOrder', {
            order: order
        });

    } catch (err) {
        res.status(404).render('error', {
            message: err.message
        });
    }
}


exports.cancelOrder = async (req, res) => {
    try{

        const orderID= req.body.orderID;

        await Order.findOneAndUpdate({_id: orderID}, {status: 'cancelled'}, {
            new: true,
            runValidators: true
        });

        const eventEmitter = req.app.get('eventEmitterKey');
        eventEmitter.emit('oderCancelled');

        res.status(204).json({
            status: "Success"
        });

    } catch (err ) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
}