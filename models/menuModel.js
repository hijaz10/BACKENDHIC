// menuModel.js
const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
    product: {
        type: String,
        required: true,
    },
    price :{
        type: String,
        required: true
    },
     remaining:{
        type: String,
        required: true
    },
    company_name:{
        type : String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
    },
});

const MenuModel = mongoose.model('menu', menuSchema);

module.exports = MenuModel;
