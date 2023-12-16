// tokenModel.js
const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
    },
});

const TokenModel = mongoose.model('Token', tokenSchema);

module.exports = TokenModel;
