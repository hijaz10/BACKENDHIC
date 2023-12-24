// menuRoutes.js
const authenticationMiddleware = require("../security/Authmiddlware");  // Import authentication middleware.

const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

router.post('/Add-Product', menuController.Addproduct)
router.patch('/:id/update-product', menuController.updateproductbyId)
router.get('/list-products', menuController.listproducts)
router.get('/getProductPrice/:productName',menuController.searchproduct)
router.delete('/:id/deleteproduct', menuController.deleteproduct)
router.post('/Addtocart', menuController.addToCart)
router.get('/:email/getcart', menuController.getCart)

module.exports = router

