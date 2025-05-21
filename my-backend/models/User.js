const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    favorites: { type: [Object], default: [] },
    orderHistory: { type: [Object], default: [] },
    cart: { type: [Object], default: [] },
    role: {
        type: String,
        enum: ['admin', 'store owner', 'user'],
        default: 'user'
    },
}, { timestamps: true }, { collection: 'User'});

module.exports = mongoose.model('User', userSchema);


