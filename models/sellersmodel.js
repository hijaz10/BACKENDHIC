const mongoose = require('mongoose');

const sellersSchema = new mongoose.Schema({
  email: { type: String, required: true }, 
  name: { type: String, required: true }, 
  company: { type: String, required: true },
  passsword:{type:String,required: true},
 DateCreted : {type:Date,default:Date.now},
});

const sellers = mongoose.model('sellers', sellersSchema);

module.exports = sellers;
