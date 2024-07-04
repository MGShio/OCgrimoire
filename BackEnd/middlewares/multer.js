const multer = require("multer");

// Multer disk storage configuration
const storage = multer.diskStorage({
  // Destination function determines where to store uploaded files
  destination: function (req, file, cb) {
    cb(null, String(process.env.IMAGES_FOLDER)); // Store files in specified folder (from environment variable)
  },
  // Filename function determines the name of uploaded files
  filename: function (req, file, cb) {
    const fileName = file.originalname.toLowerCase() + Date.now() + ".jpg"; // Generate unique filename with original name and timestamp
    cb(null, fileName); // Callback with generated filename
  }
});

// Multer upload configuration using the defined storage
const upload = multer({
  storage // Use the configured storage for file uploads
});

module.exports = { upload }; // Export the configured multer upload instance
