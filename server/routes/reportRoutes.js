const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyJWT } = require('../middleware/authMiddleware');

// Universal reporting route
router.post('/', verifyJWT, reportController.createReport);

module.exports = router;
