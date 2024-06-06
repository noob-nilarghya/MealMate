
const User= require('../../../app/models/userModel');
const JWT= require('jsonwebtoken');
const bcrypt= require('bcryptjs');
const util= require('util'); // This is inbult to node. We we use 'promisify' fn of this module to promisify JWT verify fn (see protectedAccess)
const crypto= require('crypto');
const emailLib= require('../../../email');
const path= require('path');
const fs = require('fs');

exports.viewLogin= async (req, res) => {
    try{
        res.status(200).render('auth/login', {
            message: ''
        });
    } catch(err) {
        res.status(404).render('error', {
            message: "Can't view log in page :("
        });
    }
}

exports.viewRegister= async (req, res) => {
    try{
        res.status(200).render('auth/register');
    } catch(err) {
        res.status(404).render('error', {
            message: "Can't view log in page :("
        });
    }
}

exports.viewForgotPassword= async (req, res) => {
    try{
        res.status(200).render('auth/forgotPassword');
    } catch(err) {
        res.status(404).render('error', {
            message: "Can't view forgot password page :("
        });
    }
}

exports.viewResetPassword= async (req, res) => {
    try{
        res.status(200).render('auth/resetPassword');
    } catch(err) {
        res.status(404).render('error', {
            message: "Can't view reset password page :("
        });
    }
}


exports.registerUser= async (req, res) => {
    try{

        // if user already exists
        const query= await User.findOne({email: req.body.email});
        if(query){ throw new Error("Email already registered, please use a different email"); }

        const newUser= await User.create({
            username: req.body.username, 
            email: req.body.email,
            phone: req.body.phone,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword
        });

        // configure nodemailer to send welcome mail
        // http://127.0.0.1:3000/
        const url= `${req.protocol}://${req.get('host')}/menu`;
        await new emailLib(newUser, url).sendWelcome();

        res.status(201).json({
            status: "Success"
        });

    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
}


exports.loginUser= async (req, res) => {
    try{
        
        const email= req.body.email;
        const password= req.body.password;

        if(!email || !password){
            throw new Error("Email and Password must be provided ..");
        }

        // Step2: Check if user exists and password is correct
        let query= User.findOne({email: email}); // findByEmail form DB
        query= query.select('+password'); // as password field is not visible

        const user= await query;
        if(!user){ throw new Error('User or password not recognized!...'); }

        // password in DB is hashed, so we need to decrypt it
        const correctPwd= await bcrypt.compare(password, user.password);
        // 1st arg is non-hashed pwd, 2nd one is hashed pwd

        if(!correctPwd){
            throw new Error('User or password not recognized!...');
        }

        // step3: If all okay. Send user the JWT and let user login
        const token= JWT.sign({ id: user._id}, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_expiresIN
        });

        // step4: send token on cookie
        const cookieOptions = {
            expires: new Date( Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000 ),
            httpOnly: process.env.NODE_ENV === 'development' ? false : true, // helping to protect against cross-site scripting attacks.
            secure: process.env.NODE_ENV === 'development' ? false : true, // --> [Ensures the browser only sends the cookie over HTTPS.]
            sameSite: process.env.NODE_ENV === 'development' ? false : 'none',
        };

        res.cookie('jwt', token, cookieOptions); // cookie (token) will be stored as variable named 'jwt'

        res.status(200).json({
            status: "Success",
            token: token  
        });

    } catch (err) {
        res.status(404).json({
            status: "fail",
            message: err.message
        });
    }
}

// to check wheather user is logged in or not (in backend routes). This basically is a middleware
exports.protectedAccess= async (req, res, next) => {
    try{

        // step1: wheather token is there or not
        let token;
        if(req.cookies.jwt){ // to check wheather token is there in cookie or not
            token= req.cookies.jwt;
        }

        if(!token){
            throw new Error("User is not logged in ...");
        }

        // step2: varification of JWT token
        const decoded= await util.promisify(JWT.verify) ( token, process.env.JWT_SECRET ); // need 3 arg: token, secret, option(optional)
        // console.log(decoded.id); // --> This is the id of the user that is logged in. As During login/ signup, JWT has created this token using it's id itself

        // step3: Check if user still exists (user not deactivated acc)
        const uniqueUser= await User.findById(decoded.id);
        if(!uniqueUser){
            throw new Error("This user no longer exists. Might have deleted account...");
        }

        // step4: Check if user changed password after JWT token has been generated
        if(uniqueUser.changePwdAfter(decoded.iat) === true) { // deny access
            throw new Error("User recently, changed password. Please log in again...");
        }

        // Step5: Grant access
        req.user= uniqueUser;
        // all middleware that will run after protectedAccess middleware can access loggedIn user info from 'req.user'

        next();

    } catch (err) {
        res.status(200).render('auth/login', {
            message: err.message
        });
    }
}


// to check wheather user is logged in or not (in front-end routes). This is also a middleware
exports.isLoggedIn= async (req, res, next) => {
    res.locals.user= null;

    if(req.cookies.jwt){ // or token is found from cookie
        try{
            let token= req.cookies.jwt;

            // Step1: Varification of JWT token
            const decoded= await util.promisify(JWT.verify) ( token, process.env.JWT_SECRET );

            // Step2: Check if user still exists (user not deleted his/her account)
            const uniqueUser= await User.findById(decoded.id);
            if(!uniqueUser){
                return next(); 
            }

            // Step3: Check if user changed password after JWT token has been generated
            if(uniqueUser.changePwdAfter(decoded.iat) === true){ // deny access
                return next();
            }

            // Grant Access (There is a logged in user)
            // Whatever we passsed in as 'req.locals', pug will get access to that. It is like passing variable to pug using render
            // like {{ user= uniqueUser }} in render. ===> SEE layout.ejs (if-else)
            res.locals.user= uniqueUser;
            return next();

        } catch (err) {
            return next();
        }
    }

    next();
}


exports.allowAdmin= (...roles) =>{
    return (req, res, next) =>{
        // roles: ['admin']
        if(roles.includes(req.user.role) === false){ // as we have saved 'uniqueUser' in 'user' property of 'req' object in prev middleware
            const msg= `You are ${req.user.role}. You do not have permission to perform this operation..`;
            res.status(404).render('error', {
                message: msg
            });
            // end of req-res cycle
        }

        else{ next(); }
    }
}


// NOW it's time to implement 'logout' functionality. All we have to do is to remove/delete cookie.
// But cookie is 'httpOnly', i.e we can't manupulate cookie through JS in any way. But we can do a fine trick
// Basically we will set a new cookie with same name ('jwt') but with dummy text and very short expiration time (say 10s)
// This will overwrite our existing cookie (replacing token with dummy text), which will fail to authenticate also will expire in 10s
// In this way we can smartly logout our user without directly manupulating httpOnly cookie 
exports.logOut= async (req, res) => {
    const cookieOptions= {
        expires: new Date( Date.now() + 10* 1000 ),
        httpOnly: process.env.NODE_ENV === 'development' ? false : true, // helping to protect against cross-site scripting attacks.
        secure: process.env.NODE_ENV === 'development' ? false : true, // --> [Ensures the browser only sends the cookie over HTTPS.]
        sameSite: process.env.NODE_ENV === 'development' ? false : 'none',
    }
    res.cookie('jwt', 'dummyText', cookieOptions);

    res.status(200).json({
        status: "Success"
    });
}


exports.forgotPasswordUser= async (req, res) => {
    try{
        const email= req.body.email;

        // Step1: Get user from email
        const user= await User.findOne({ email: email });

        if(!user){
            throw new Error("There is no user with this email ID");
        }

        // Step2: Generate random reset token (using crypto)
        const resetToken= user.createPwdResetToken(); 
        await user.save({ validateBeforeSave: false });
        // encrypted token is saved in passwordResetToken, and this is the originalToken, that needed to be sent to user

        // Step3: Send original reset token to user's email
        try{
            const resetURL= `${req.protocol}://${req.get('host')}/resetPassword/${resetToken}`; // https://127:0:0:1/resetPassword/{resetToken}

            await new emailLib(user, resetURL).sendPasswordReset();

            res.status(200).json({
                status: "Success",
                message: "Reset Link sent successfully in email!"
            });
        } catch(err) {
            // Reset/Delete 'passwordResetToken' and 'passwordResetExpires'
            user.passwordResetToken= undefined;
            user.passwordResetExpires = undefined;
            await user.save({validateBeforeSave: false});

            res.status(404).json({
                status: "fail",
                message: err.message
            });
        }

    } catch (err) {
        res.status(404).json({
            status: "fail",
            message: err.message
        });
    }
}



exports.resetPasswordUser= async (req, res) => {
    try{
        const resetToken= req.body.token;

        // step1: Get User based on token (url parameter)
        const hashedToken= crypto.createHash('sha256').update(resetToken).digest('hex');
        // Now we will find that user from this hashedToken from DB
        console.log(hashedToken);
        
        // Step2: Check if user is there with that token and also token has not expired
        const user= await User.findOne( {passwordResetToken: hashedToken, passwordResetExpires: {$gt: Date.now()} } ); // user whose token is equal to encrypted token and also token has not expired

        if(!user){
            throw new Error("Either user is not found or password reset token is wrong or has been expired");
        }

        // Step3: Actually update password
        user.password= req.body.password;
        user.confirmPassword= req.body.confirmPassword;

        user.passwordResetToken=undefined;
        user.passwordResetExpires=undefined;

        // Update 'passwordChangedAt' property for user (so that we can use it to find wheather password is changed after JWT token has been issued or not 😅)
        user.passwordChangedAt = Date.now() - 1000; // 1sec earlier to ensure that pwd always changes before JWT_token issued

        await user.save(); // as password propery are updated, so always validateBeforeSave


        res.status(200).json({
            status: "Success"
        });
    } catch (err) {
        res.status(404).json({
            status: "fail",
            message: err.message
        });
    }
}


// We can't update every field that user wants. Like user want to update role to "admin", whcih we cant allow
const filterObj = (obj, ...allowedFields) =>{ // 'obj' is req.body, and 'allowedField' is array of name of field which are supposed to be updated
    const newObj = {};
    Object.keys(obj).forEach( function(el){
        if(allowedFields.includes(el) === true) {
            newObj[el]= obj[el];
        }
    });

    return newObj;
}


// We have all the user data in 'req.user', as this is a protected route
exports.updateInfo= async (req, res) => {
    try{
        // 1) If user want to update 'password', we will throw error and ask user to change password in 'updatePassword' route
        if(req.body.password || req.body.passwordConfirm){
            throw new Error("This route is not for password update...");
        }

        // 2) Update rest of the filtered fields
        const filterField= filterObj(req.body, 'username', 'email', 'phone');
        let oldPhotoName=''; // to delete old photo

        if(req.file) { // if there is any field name 'req.file'. Then it means user wants to upload picture
            filterField.photo= req.file.filename; // add a new field named 'photo'
            // 'req.file.filename' store the name (that we have specified in 'multerStorage') of uploaded photo
            oldPhotoName= req.user.photo; // to remove old photo
        }

        if(!filterField){
            throw new Error("There is no field to update ... ");
        }

        if(oldPhotoName !== '' && oldPhotoName !== 'default.jpeg') {
            const filePath = path.join(process.cwd(), 'public', 'img', 'userPic', oldPhotoName);
            fs.unlink(filePath, (err) => {
                if (err) { console.log('Error deleting file!'); } 
                else { console.log('File deleted successfully!'); }
            });
        }

        // 3) Update users document.   find only among active users --> see 'find' middleware in model
        const updatedUser= await User.findByIdAndUpdate(req.user._id, filterField, {
            new: true,
            runValidators: false
        });

        res.status(200).json({
            status: "Success",
            data : {
                user: updatedUser
            }
        });
    } catch (err) {
        res.status(404).json({
            status: "fail",
            message: err.message
        });
    }
}



// This would be a patch request to update pwd only. Here user have to provide 3 field in body: 'currentPassword', 'newPassword', 'newconfirmPassword'
// Before update password, user should be logged in. So we will call 'protectedAccess' middleware before 'updatePassword' every time
// So we would have user's ID in 'req.user._id'
exports.updatePassword = async (req, res) =>{
    try{
        // 1) Get users from collections,  find only among active users --> see 'find' middleware in model
        const user= await User.findOne({_id : req.user._id}).select('+password'); 

        // 2) Check if posted password is correct
        const correctPwd= await bcrypt.compare(req.body.currentPassword, user.password); // 1st arg is non-hashed pwd, 2nd arg is hashed pwd
        if(!correctPwd){ throw new Error("Password is incorrect"); }

        // 3) Finally update password and save (with validation)
        user.password= req.body.newPassword;
        user.confirmPassword= req.body.newConfirmPassword;
        user.passwordChangedAt = Date.now() - 1000; // prev JWT_token was issued in past, and we are currently changing user password, so we are autometically logged out
        // On password change in a web application, we should log out

        await user.save(); // save with validation check

        res.status(200).json({
            status: "Success"
        });
    } catch (err){
        res.status(404).json({
            status: "fail",
            message: err.message
        });
    }
}


// This is delete request. User need to provide nothing in body, as we will deactivate loggedIn user only
//Before deactivating acc, user need to be loggged in, so we will call 'protectedAccess' middleware before 'updatePassword' every time
// so all info of user will be in req.user. So we would have user's ID in 'req.user._id'
exports.deactivateUser = async (req, res) => {
    try{    
        const updatedUser= await User.findByIdAndUpdate(req.user._id, {active : false} ); 
        // find only among active users --> see 'find' middleware in model and deactivate the one with that perticular id (so that it will not come in any of furthur results)
        req.user=null;

        res.status(204).json({
            status: 'Success',
            data: null
        });
    } catch (err) {
        res.status(404).json({
            status: "fail",
            message: err.message
        });
    }
}
// Deactivated user have nothing to do with logIn, protectedAccess, forgotPwd, resetPwd, updatePwd, UpdateUserInfo etc etc. For all this to happen, we need query middleware. We will need a 'pre' query middleware that will restrict display of deactivated users, whenever we query in DB with any cmd that starts with 'find'
