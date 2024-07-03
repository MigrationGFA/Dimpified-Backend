// const multer = require("multer");
// const fs = require("fs");
// const path = require("path");

// const uploadDir = path.join(__dirname, "../uploads/");
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, uploadDir); // Specify the destination folder for uploads
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname); // Use the original filename
//   },
// });

// const formStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, uploadDir);
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// const isValidFile = (file) => {
//   const validFormats = ["image/jpeg", "image/png", "image/gif"];
//   const filePath = path.resolve(file.path);

//   try {
//     if (fs.existsSync(filePath) && validFormats.includes(file.mimetype)) {
//       return true;
//     }
//   } catch (err) {
//     console.error("File validation error:", err);
//   }
//   return false;
// };

// const upload = multer({ storage });
// const formUpload = multer({ storage: formStorage });

// module.exports = { upload, formUpload, isValidFile };
