require("dotenv").config();
const bcrypt = require("bcrypt");
const MenuModel = require('../models/menuModel');
const purchaseinfo = require('../models/purchaseinfo');
const crypto = require("crypto");
const paystack = require("paystack")(process.env.PAYSTACK_KEY);
const UserModel = require('../models/userModel');
const CartItem = require("../models/cartModel");


function generatePaymentReference() {
    const randomString = crypto.randomBytes(16).toString('hex');
    return randomString;
  }


  const payforproduct = async (req, res, next) => {
    try {
      let quantity = req.body.quantity;
      let location = req.body.location;
      let email = req.body.email;
      let price = req.body.price;
      let company_name = req.body.company_name;
      let product = req.body.product;
      let phonenumber = req.body.phonenumber;
      let remaining = req.body.remaining
  
      const verifyemail = await UserModel.findOne({ email });
  
      if (!verifyemail) {
        res.status(404).json({ "message": "User not found, Please try logging in or check your email and try again" });
      } else {
        const menuProduct = await MenuModel.findOne({ product });
  
        if (menuProduct) {
          const productprice = menuProduct.price;
          let amountConverted = productprice * 100; // to make it price.00
          const paymentReference = generatePaymentReference();
  
          const response = await paystack.transaction.initialize({
            email: email,
            amount: amountConverted * quantity,
            reference: paymentReference,
          });
  
          const { authorization_url, access_code } = response.data;
  
          // Reduce the remaining product quantity
          const updatedRemaining = menuProduct.remaining - quantity;
  
          // Update the remaining quantity in the MenuModel
          await MenuModel.updateOne({ product }, { remaining: updatedRemaining });
  
          const productData = {
            product,
            price,
            email,
            company_name,
            location,
            quantity,
            paymentReference,
            phonenumber,
            updatedRemaining,
          };
  
          // Save the purchase info only after Paystack confirms the payment
          const addedproduct = await purchaseinfo.create(productData);
  
          res.status(200).json({
            authorization_url,
            paymentReference,
            addedproduct,
            updatedRemaining,

          });
        } else {
          res.status(404).json({ message: "Product not found" });
        }
      }
  
    } catch (error) {
      console.error(error);
      res.status(500).send("Error initiating payment");
    }
  };
  


function  webhookforproduct(req,res,next){
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

// route controller file

const findpurchase = async (req, res, next) => {
  const paymentReference = req.params.paymentReference;

  try {
    const purchase = await purchaseinfo.findOne({ paymentReference });

    if (!purchase) {
      res.status(404).json({ message: "Purchase not found" });
    } else {
      res.status(200).json({ purchase });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unknown error occurred", error });
  }
};



// Route to initiate payment using Paystack
/*const payforcart = async (req, res) => {
  try {
    const email = req.params.email;
    let location = req.body.location;
    let company_name = req.body.company_name;
    let phonenumber = req.body.phonenumber;
    let updatedRemaining = req.body.updatedRemaining

    // Calculate the total amount based on the items in the cart
    const cartItems = await CartItem.find({ email });
    const totalAmount = cartItems.reduce((acc, item) => acc + item.price, 0);

    function generatePaymentReference() {
      const randomString = crypto.randomBytes(16).toString('hex');
      return randomString;
    }

    // Use the Paystack API to initiate payment
    const paymentReference = generatePaymentReference();

    const paymentResponse = await paystack.transaction.initialize({
      email,
      amount: totalAmount * 100, // Paystack expects amount in kobo
      reference: paymentReference,
    });

    const { authorization_url, access_code } = paymentResponse.data;

    // Reduce the remaining quantity of each product in the cart
    for (const item of cartItems) {
      const menuProduct = await MenuModel.findOne({ product: item.product });

      if (menuProduct) {
        const updatedRemaining = menuProduct.remaining - item.quantity;
        await MenuModel.updateOne({ product: item.product }, { remaining: updatedRemaining });
      }
    }

    // Save the purchase info after Paystack confirms the payment
    const addedproduct = await purchaseinfo.create({
      products: cartItems.map(item => ({
        product: item.product,
        price: item.price,
        quantity: item.quantity,
      })),
      email,
      company_name,
      location,
      paymentReference,
      phonenumber,
      updatedRemaining,
    });

    res.status(200).json({
      authorization_url,
      addedproduct,
      updatedRemaining,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error initiating payment' });
  }
};
*/


    module.exports ={
        payforproduct,
        webhookforproduct,
        findpurchase,
        //payforcart,
    }
