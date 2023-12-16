require("dotenv").config();
const crypto = require("crypto");
const paystack = require("paystack")(process.env.PAYSTACK_KEY);

function generatePaymentReference() {
    const randomString = crypto.randomBytes(16).toString('hex');
    return randomString;
  }
function pay(req,res,next){
    try {
        const price = 50000;
        let amountConverted = parseFloat(price).toFixed(2); // to make it price.00
        console.log(amountConverted);
        const paymentReference = generatePaymentReference();
    
        const response =paystack.transaction.initialize({
          email: "muhdhijaz10@gmail.com",
          amount: amountConverted,
          reference: paymentReference,
        });
    
        const { authorization_url, access_code } = response.data;
    
        console.log(response);
        res.status(200).json({
          authorization_url,
          paymentReference,
        });
      } catch (error) {
        console.error(error);
        res.status(500).send("Error initiating payment");
      }
    };

function webhook(req,res,next){
    try {
        console.log(req.body);
        // Only handle charge success events
        if (req.body.event === "charge.success") {
          res.status(200).json("Payment confirmed");
        } else {
          res.status(500).json("Error verifying payment");
        }
      } catch (error) {
        console.error(error);
        res.status(500).send("Error verifying payment");
    }
    };

    module.exports ={
        pay,
        webhook,
    }
