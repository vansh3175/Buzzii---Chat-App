const cloudinary = require('cloudinary').v2;
require("dotenv").config();
const {CloudinaryStorage} = require('multer-storage-cloudinary');
const multer = require('multer');


cloudinary.config({
    cloud_name : process.env.CLOUD_NAME,
    api_key : process.env.CLOUD_API_KEY,
    api_secret : process.env.CLOUD_API_SECRET
})


const storage = new CloudinaryStorage({
    cloudinary:cloudinary,
    params: {
    folder: 'Buzzii',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    
  },
})

const upload = multer({ storage });

module.exports={cloudinary,upload};
