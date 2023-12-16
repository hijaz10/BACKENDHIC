const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  email: { type: String, required: true }, 
  product: { type: String, required: true }, 
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
 DateCreted : {type:Date,default:Date.now},
});

const CartItem = mongoose.model('CartItem', cartItemSchema);

module.exports = CartItem;
