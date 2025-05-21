const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      kitchenId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cook', required: true },
      dishName: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }
    }
  ],
  totalPrice: { type: Number, required: true },
  purchasedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Purchase', purchaseSchema);