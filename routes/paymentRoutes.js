const authenticationMiddleware = require("../security/Authmiddlware");  // Import authentication middleware.

const express = require("express");
const router = express.Router();
const paymentcontroller = require("../controllers/paymentcontroller");

router.post("/pay",paymentcontroller.pay);
router.post("/webhook",authenticationMiddleware,paymentcontroller.webhook);

module.exports=router;
