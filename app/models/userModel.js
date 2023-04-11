const mongoose = require('mongoose');
const validator= require('validator');
const bcrypt= require('bcryptjs'); // password encryption
const crypto= require('crypto'); // random token generate

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: [true, 'User must have a name']
    },
    email: { 
        type: String, 
        required: [true, 'User must have a email'],
        unique: [true, 'This email is already in use, please use another email']
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    phone: {
        type: String,
        required: [true, 'User must provide a phone number'],
        match: [/^(\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/, 'Phone number is not in correct fromat']
    },
    password: { 
        type: String, 
        required: [true, 'User must have a password'],
        minLength: 8,
        select: false
    },
    confirmPassword: {
        type: String,
        required: [true, 'Please provide a confirm password'],
        minLength: 8,
        validate: {
            // This function will not work on update. Validation will only work on CREATE and SAVE
            // To check wheather password is equal to confirm password
            validator: function(el){
                return (el === this.password );
            },
            message: 'Password is not matching....'
        }
    },
    role: { 
        type: String, 
        enum: ['user', 'admin'],
        default: 'user'
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date ,
    active: { // active user (who has not deleted (deactivated) his/her account)
        type: Boolean,
        default: true,
        select: false // we can't display this info
    }
});



// pre' 'save' document middleware, that will hash pwd just before saving
userSchema.pre('save', async function(next) {
    // only encrypt password if password is modified
    if(this.isModified('password') === true) {
        // hash pwd with cost 12. (default 10)
        // password is encrypted using 'bcryptjs' package
        this.password = await bcrypt.hash(this.password, 12); // hash is async, 'hashSync' is sync

        this.confirmPassword= undefined;   // Delete 'passwordConfirm' field
    }

    next();
});


// There are 2 types: 'methods' and 'statics'. Method are called on documents, where statics are called on model itslef(in model).
// But both types are declared with model.
// 'this' in methods points to 'documents' with which it is attached. 'this' in statics points to 'model' with whcih it is attached.
// '<schema>.method' functions can be accessed anywhere (maily it will be called in authController)


// what happen if user changed their pwd after token is isuued
userSchema.methods.changePwdAfter= function(JWT_timestamp) {
    // Here 'this' is document with which it is attached to
    if(this.passwordChangedAt){
        const changeTimeStamp= parseInt(this.passwordChangedAt.getTime()/1000, 10);
        return JWT_timestamp < changeTimeStamp; // agar token issue hone ke baad password change kiya gya --> Deny access (true)
    }

    return false; // allow accesss
}

userSchema.methods.createPwdResetToken= function() {
    // Here 'this' is document with which it is attached to
    
    // random token is generated using 'crypto'
    const resetToken= crypto.randomBytes(32).toString('hex'); // This will generate random 32 char hex string
    // we will send resetToken to user for reseting their pwd. Basically this token acts as a key

    // But we will store token's hashed (encrypted) string in DB.
    // So that letter we can match token to find user whose pwd need to be reseted
    this.passwordResetToken= crypto.createHash('sha256').update(resetToken).digest('hex');

    this.passwordResetExpires = Date.now() +10*60*1000; // ms (10 min after current time)

    return resetToken; // user ko actual reset token 
}


// Deactivated user have nothing to do with logIn, protectedAccess, forgotPwd, resetPwd, updatePwd, UpdateUserInfo etc etc.
// For all this to happen, we need query middleware. We will need a 'pre' query middleware that will restrict display of deactivated users, whenever we query in DB with any cmd that starts with 'find'
// this 'pre' query middleware will restrict display of deactivated users, whenever we query in DB with any cmd that starts with 'find'

userSchema.pre(/^find/, function(next, req) {
    this.find( { active: {$ne: false}} );  // Activated user are those whose active status is undefined or not false
    
    next();
});

const User = mongoose.model('User', userSchema);

module.exports= User;