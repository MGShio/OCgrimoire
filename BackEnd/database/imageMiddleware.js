const multer = require('multer');
const sharp = require('sharp');

// List of MIME types accepted
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

// Configuration for file storage
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, Date.now() + name + '.' + extension);
  },
});

// File filtering based on MIME types
const fileFilter = (req, file, callback) => {
  const isValid = MIME_TYPES[file.mimetype];
  if (isValid) {
    callback(null, true);
  } else {
    callback(new Error('Unsupported file type.'), false);
  }
};

// Multer configuration for file upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 4 * 1024 * 1024, // Limit file size to 4MB
  },
  fileFilter: fileFilter,
}).single('image');

// Image resizing
const compressImage = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const filePath = req.file.path;

  sharp(filePath)
    .resize({ fit: 'cover', height: 643, width: 500 })
    .webp({ quality: 85 })
    .toBuffer()
    .then((data) => {
      sharp(data)
        .toFile(filePath)
        .then(() => {
          next();
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
};

// Handle file upload errors and proceed with the request
const uploadImage = (req, res, next) => {
  upload(req, res, function (err) {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          message: 'File size too large (max 4MB).',
        });
      } else if (err.message === 'Unsupported file type.') {
        return res.status(400).json({ message: err.message });
      } else {
        return res.status(400).json({ message: err.message });
      }
    }

    next();
  });
};

module.exports = {
  uploadImage,
  compressImage,
};
