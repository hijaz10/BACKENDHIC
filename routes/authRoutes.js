// authRoutes.js
const authenticationMiddleware = require("../security/Authmiddlware");  // Import authentication middleware.

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/registerseller',authenticationMiddleware, authController.registerseller);
router.post('/registerAdmins', authController.registerAsAdmin);
router.post('/loginAsAdmin',authenticationMiddleware, authController.loginAsAdmin);
router.post('/login', authController.login);
router.patch('/change-password', authController.changePassword);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/change-forgotpassword', authController.changeforgetpass);
router.post('/:id', authController.findbyid);
router.patch('/updateinfo', authController.updateuserinfo);
router.delete("/deleteuser",authController.deleteuser);


module.exports = router;
