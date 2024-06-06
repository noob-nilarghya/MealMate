const express = require('express');
const homeController= require('../app/http/controllers/homeController');
const authController= require('../app/http/controllers/authController');
const cartController= require('../app/http/controllers/customer/cartController');
const orderController= require('../app/http/controllers/customer/orderController');
const paymentController= require('../app/http/controllers/customer/paymentController');
const adminOrderController= require('../app/http/controllers/admin/adminOrderController');
const userPhotoController= require('../app/http/controllers/userPhotoController');
const foodPhotoController= require('../app/http/controllers/foodPhotoController');
const router = express.Router(); 

// Global middleware
router.use(authController.isLoggedIn);

router.route('/')
    .get(homeController.viewHome);

router.route('/menu')
    .get(homeController.viewMenu);

router.route('/cart')
    .get(cartController.viewCart);

router.route('/add-cart')
    .post(cartController.addCart);

router.route('/add-item-from-cart')
    .post(cartController.addItemFromCart);

router.route('/remove-cart')
    .post(cartController.removeCart);

router.route('/login')
    .get(authController.viewLogin);

router.route('/login-user')
    .post(authController.loginUser);

router.route('/register')
    .get(authController.viewRegister);

router.route('/register-user')
    .post(authController.registerUser);

router.route('/logout-user')
    .get(authController.protectedAccess, authController.logOut);

router.route('/forgot-password')
    .get(authController.viewForgotPassword);

router.route('/forgot-password-user')
    .post(authController.forgotPasswordUser);

router.route('/resetPassword/:token')
    .get(authController.viewResetPassword);

router.route('/reset-password-user')
    .patch(authController.resetPasswordUser);

router.route('/order-cart')
    .post(authController.protectedAccess, paymentController.createOrder);

router.route('/payment/verify')
    .post(authController.protectedAccess, paymentController.verifyPayment);

router.route('/customer-order')
    .get(authController.protectedAccess, orderController.fetchCustomerOrder);

router.route('/admin-order')
    .get(authController.protectedAccess, authController.allowAdmin('admin'), adminOrderController.fetchAdminOrder);

router.route('/admin-order-refund-status')
    .get(authController.protectedAccess, authController.allowAdmin('admin'), adminOrderController.fetchIssuedForRefund);

router.route('/admin-order/status')
    .post(authController.protectedAccess, authController.allowAdmin('admin'), adminOrderController.statusUpdateAdminOrder);
    // basically it is a patch request, but we can only perform method 'GET'/'POST' from form submit

router.route('/admin-order/refund-accept-decline')
    .post(authController.protectedAccess, authController.allowAdmin('admin'), adminOrderController.refundStatusUpdate);
    // basically it is a patch request, but we can only perform method 'GET'/'POST' from form submit

router.route('/customer-order/:orderID')
    .get(authController.protectedAccess, orderController.fetchCustomerSingleOrder);

router.route('/cancel-order')
    .patch(authController.protectedAccess, orderController.cancelOrder);

router.route('/me')
    .get(authController.protectedAccess, homeController.viewMe);

router.route('/update-info')
    .get(homeController.viewUpdateInfo);

router.route('/update-info-user')
    .patch( authController.protectedAccess, 
            userPhotoController.uploadPhoto, 
            userPhotoController.userPhotoProcessing, 
            authController.updateInfo);

router.route('/update-password')
    .get(homeController.viewUpdatePassword);

router.route('/update-password-user')
    .patch(authController.protectedAccess, authController.updatePassword);

router.route('/deactivate-user')
    .patch(authController.protectedAccess, authController.deactivateUser);

router.route('/admin-add-food')
    .get(authController.protectedAccess, authController.allowAdmin('admin'), adminOrderController.viewAddFood);

router.route('/admin-backend-add-food')
    .post(  authController.protectedAccess, 
            authController.allowAdmin('admin'), 
            foodPhotoController.uploadPhoto,
            foodPhotoController.foodPhotoProcessing,
            adminOrderController.addFoodBackend);

router.route('/sitemap.xml')
    .get((req, res) => {
        res.sendFile(path.join(process.cwd(), "sitemap.xml"));
    })

router.route('*').get(homeController.viewError);

// Bhosdike total 31 routes hai, isme tera ghar a jayenga chadarmod


module.exports= router;