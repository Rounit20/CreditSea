const express = require('express');
const router = express.Router();
const creditController = require('../controllers/creditController');
const multer = require('multer');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'text/xml' || file.originalname.endsWith('.xml')) {
    cb(null, true);
  } else {
    cb(new Error('Only XML files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Routes
router.post('/upload', upload.single('xmlFile'), creditController.uploadXML);
router.get('/reports', creditController.getAllReports);
router.get('/reports/:id', creditController.getReportById);
router.delete('/reports/:id', creditController.deleteReport);

module.exports = router;