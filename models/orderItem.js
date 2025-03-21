const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Order' },
  product_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
}, {
  timestamps: false
});

const OrderItem = mongoose.model('OrderItem', orderItemSchema);
module.exports = OrderItem;
