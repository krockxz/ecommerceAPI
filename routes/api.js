// routes/api.js
const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Cart = require('../models/cart');
const Order = require('../models/order');
const OrderItem = require('../models/orderItem');

router.get('/products', async (req, res) => {
  try {
    const { name, minPrice, maxPrice, inStock } = req.query;

    let filter = {};
    if (name) filter.name = new RegExp(name, 'i');
    if (minPrice) filter.price = { $gte: minPrice };
    if (maxPrice) filter.price = { $lte: maxPrice };
    if (inStock === 'true') filter.stock = { $gt: 0 };

    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching products', error: err });
  }
});

router.post('/cart', async (req, res) => {
  const { user_id, product_id, quantity } = req.body;
  try {
    const product = await Product.findById(product_id);
    if (!product || product.stock < quantity) {
      return res.status(400).json({ message: 'Product out of stock or invalid' });
    }

    let cart = await Cart.findOne({ user_id });
    if (!cart) {
      cart = new Cart({ user_id });
      await cart.save();
    }

    cart.cartItems.push({ product_id, quantity });
    await cart.save();

    product.stock -= quantity;
    await product.save();

    res.status(201).json({ message: 'Product added to cart', cart });
  } catch (err) {
    res.status(500).json({ message: 'Error adding product to cart', error: err });
  }
});

router.get('/cart', async (req, res) => {
  const { user_id } = req.query;
  try {
    const cart = await Cart.findOne({ user_id }).populate('cartItems.product_id');
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching cart', error: err });
  }
});

router.post('/checkout', async (req, res) => {
  const { user_id } = req.body;
  try {
    const cart = await Cart.findOne({ user_id }).populate('cartItems.product_id');
    if (!cart || cart.cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const totalAmount = cart.cartItems.reduce((sum, item) => sum + (item.quantity * item.product_id.price), 0);

    const order = new Order({
      user_id,
      total_amount: totalAmount
    });

    await order.save();

    for (const item of cart.cartItems) {
      const orderItem = new OrderItem({
        order_id: order._id,
        product_id: item.product_id._id,
        quantity: item.quantity,
        price: item.product_id.price
      });

      await orderItem.save();
      const product = await Product.findById(item.product_id);
      product.stock -= item.quantity;
      await product.save();
    }

    cart.cartItems = [];
    await cart.save();

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    res.status(500).json({ message: 'Error during checkout', error: err });
  }
});

router.get('/orders', async (req, res) => {
  const { user_id, startDate, endDate } = req.query;
  try {
    const orders = await Order.find({
      user_id,
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
    }).populate('orderItems.product_id');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders', error: err });
  }
});

module.exports = router;
