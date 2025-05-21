const mongoose = require('mongoose');

// Sub-schema for menu items
const menuItemSchema = new mongoose.Schema({
    dishName: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    available: { type: Boolean, default: true },
    image: { type: String, default: null }, // URL for menu item image
});

const cookSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    rating: { type: Number, required: true, min: 0, max: 5 },
    menu: { type: [menuItemSchema], default: [] }, // Array of menu items
    phone: { type: String, required: true },
    verified: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User
    image: { type: String, default: null }, // URL for cook image
}, { timestamps: true });

module.exports = mongoose.model('Cook', cookSchema);