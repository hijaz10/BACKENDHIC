const mongoose = require('mongoose');

const AdminsSchema = new mongoose.Schema({
  email: { type: String, required: true,unique : true }, 
  name: { type: String, required: true }, 
  company: { type: String, required: true },
  password:{type: String,required:true},
 DateCreted : {type:Date,default:Date.now},
});

const Admins = mongoose.model('Admins', AdminsSchema);

module.exports = Admins;
