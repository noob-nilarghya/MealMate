
const multer= require('multer'); // to upload user image
const sharp= require('sharp'); // to resize and compress uploaded photo


//                      ---------------- Uploading and Processing Photo -----------------
// NOTE: we store the actual photo in our destination folder, our DB will only store the name of photo

// We can't just store photo directly. For example, user has photo of 10MB size. We just can't directly store this in dest folder without processing. In such case, we need to first store it in or BUFFER MEMORY. Then we process the photo (compress+crop) with 'sharp' and store the final low sized image to our actual destination folder 'public/img/users'

const multerStorage_Ideal= multer.memoryStorage(); 

const multerFilter = (req, file, anyCallback) => {
    if(file.mimetype.split('/')[0] === 'image'){ // ('image/jpeg') if uploaded file is image, then only allow
        anyCallback(null, true);
    }
    else{
        anyCallback(new Error("Not an image! Please upload only image."), false);
    }
}

const upload= multer({
    storage: multerStorage_Ideal,
    fileFilter: multerFilter
});

exports.uploadUserPhoto= upload.single('photo'); // 'photo' is name of filed where uploaded file can be accessed from form
// In other word, there should be {{name='photo'}} in form input

// After uploaded photo is stored in destination folder. We now need to process photo (crop+compress) before storing it in proper location (see .toFile() )

exports.userPhotoProcessing = async (req, res, next) => {
    if(!req.file){ return next(); } // if there is upload, it should be there in 'req.file'

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`; // to use it in 'authController->updateInfo'

    await sharp(req.file.buffer) // as raw uploaded image is stored in buffer memory
        .resize(150, 150) // resize to 150px X 150px
        .toFormat('jpeg')
        .jpeg( {quality: 90} ) // retain 90% of original quality
        .toFile(`public/img/userPic/${req.file.filename}`); // retain 90% of original quality

    next();
}
