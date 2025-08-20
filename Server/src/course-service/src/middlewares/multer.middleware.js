// src/middlewares/multer.middleware.js
import multer from 'multer';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Dossier pour stocker les fichiers
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Nom unique
  },
});

const upload = multer({ storage: storage });

export default upload;