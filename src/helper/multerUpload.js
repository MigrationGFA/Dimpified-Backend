const path = require('path');
const fs = require('fs');
const multer = require("multer");


const storageCourse = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join( 'uploads', 'Courses');

    // Check if the directory structure exists. If not, create it recursively.
    fs.access(uploadPath, fs.constants.F_OK, (err) => {
      if (err) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    });
  },
  filename: (req, file, cb) => {
    // Generate a unique filename to prevent conflicts
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const storageTemplate = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join( 'uploads', 'template');

    // Check if the directory structure exists. If not, create it recursively.
    fs.access(uploadPath, fs.constants.F_OK, (err) => {
      if (err) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    });
  },
  filename: (req, file, cb) => {
    // Generate a unique filename to prevent conflicts
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const storageForm = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join( 'uploads', 'form');

    // Check if the directory structure exists. If not, create it recursively.
    fs.access(uploadPath, fs.constants.F_OK, (err) => {
      if (err) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    });
  },
  filename: (req, file, cb) => {
    // Generate a unique filename to prevent conflicts
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});


module.exports = {storageCourse, storageTemplate, storageForm}