// authRoutes.js
const authenticationMiddleware = require("../security/Authmiddlware");  // Import authentication middleware.

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.post('/reportforfaileddelivery', reportController.Faileddeliverycomplains)
router.post('/reportcompany', reportController.reportcompanycomplains)


module.exports = router;
