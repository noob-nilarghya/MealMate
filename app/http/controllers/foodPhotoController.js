
const multer= require('multer'); // to upload user image
const sharp= require('sharp'); // to resize and compress uploaded photo

const multerStorage_Ideal= multer.memoryStorage(); 

const multerFilter = (req, file, anyCallback2) => {
    if(file.mimetype.split('/')[0] === 'image'){ // ('image/jpeg') if uploaded file is image, then only allow
        anyCallback2(null, true);
    }
    else{
        anyCallback2(new Error("Not an image! Please upload only image."), false);
    }
}

const upload= multer({
    storage: multerStorage_Ideal,
    fileFilter: multerFilter
});

exports.uploadPhoto= upload.single('foodPhoto'); 

exports.foodPhotoProcessing = async (req, res, next) => {
    if(!req.file){ return next(); } // if there is upload, it should be there in 'req.file'

    req.file.filename = `food-${parseInt(Date.now() * Math.random())}.jpeg`; // to use it in 'authController->updateInfo'

    await sharp(req.file.buffer) // as raw uploaded image is stored in buffer memory
        .resize(500, 500) // resize to 500px X 500px
        .toFormat('jpeg')
        .jpeg( {quality: 90} ) // retain 90% of original quality
        .toFile(`public/img/foodPic/${req.file.filename}`); // retain 90% of original quality

    next();
}