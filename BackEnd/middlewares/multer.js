const multer = require('multer'); // Import multer for handling file uploads
const path = require('path'); // Import path for handling and transforming file paths

// Use the IMAGES_FOLDER environment variable or default to 'public/images' if not set
const imagesFolder = process.env.IMAGES_FOLDER || 'public/images';

const storage = multer.diskStorage({
  // Set the destination directory for uploaded files
  destination: function (req, file, cb) {
    cb(null, path.resolve(imagesFolder)); // Resolve the path to avoid issues with relative paths
  },
  // Set the filename for the uploaded file
  filename: function (req, file, cb) {
    // Generate a unique filename using the original name, current timestamp, and file extension
    const fileName = file.originalname.toLowerCase().split(' ').join('_') + Date.now() + path.extname(file.originalname);
    cb(null, fileName); // Pass the filename to the callback
  }
});

// Create an upload middleware using the defined storage configuration
const upload = multer({ storage });

module.exports = { upload }; // Export the upload middleware for use in other parts of the application
