const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  cartItems: [
    {
      product_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
      quantity: { type: Number, required: true }
    }
  ]
}, {
  timestamps: true
});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
