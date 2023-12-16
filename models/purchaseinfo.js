// product purchased
const mongoose = require('mongoose');

const purchasedSchema = new mongoose.Schema({
    location : {
        type: String,
        required: true,
    },
    quantity : {
        type: String,
        required: true,
    },
    company_name : {
        type : String,
        required : true,
    },
    email: {
        type: String,
        required : true,
    },
    product: {
        type: String,
        required : true,
    },
    paymentRefrence: {
        type: String
    },
    phonenumber :{
        type : String,
        required : true
    },
paymentDate: { type: Date, default: Date.now },

});

const purchaseinfo = mongoose.model('purchaseinfo', purchasedSchema);

module.exports = purchaseinfo;
