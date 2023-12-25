const mongoose = require('mongoose');

const Reportcompany = new mongoose.Schema({
  email: { type: String, required: true }, 
  message: { type: String, required: true }, 
 DateCreted : {type:Date,default:Date.now},
});

const reportcompany = mongoose.model('reportcompany', Reportcompany);

module.exports = reportcompany;



