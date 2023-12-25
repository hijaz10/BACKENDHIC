const authenticationMiddleware = require("../security/Authmiddlware");  // Import authentication middleware.

const express = require("express");
const router = express.Router();
const paymentcontroller = require("../controllers/payforproduct");

router.post("/pay",paymentcontroller.payforproduct)
router.post("/webhook",authenticationMiddleware,paymentcontroller.webhookforproduct)
router.post("/:findPurchaseByRefrence",authenticationMiddleware,paymentcontroller.findpurchase)
//router.post('/pay-for-cart/:email',paymentcontroller.payforcart);

module.exports=router;
