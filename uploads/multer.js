// ********************* first **********************
// const multer = require("multer");
// const path = require("path");

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, "public/images"); // Ensure this directory exists
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//         cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
//     },
// });

// const upload = multer({ storage: storage });

// module.exports = { upload }; // Make sure it's exported properly
// ********************* first **********************


require("dotenv").config();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

// Multer-Cloudinary Storage
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "uploads", // Folder in Cloudinary
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
    },
  });
  
  const upload = multer({ storage });
  module.exports = { upload }; // Make sure you are exporting `upload`