const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Cart = require('../models/cart');
const Order = require('../models/order');
const OrderItem = require('../models/orderItem');
const mongoose = require('mongoose');

router.get('/products', async (req, res) => {
  try {
    const { name, minPrice, maxPrice, inStock } = req.query;

    let filter = {};
    
    if (name) filter.name = new RegExp(name, 'i');
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    if (inStock === 'true') filter.stock = { $gt: 0 };

    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Error fetching products', error: err.message });
  }
});

router.post('/cart', async (req, res) => {
  const { product_id, quantity } = req.body;
  
  if (!product_id || !quantity) {
    return res.status(400).json({ message: 'Product ID and quantity are required' });
  }
  
  try {
   
    const user_id = req.body.user_id || '6500000000000000000000aa';
    
    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (product.stock < quantity) {
      return res.status(400).json({ message: `Only ${product.stock} items available in stock` });
    }

    let cart = await Cart.findOne({ user_id });
    if (!cart) {
      cart = new Cart({ 
        user_id: mongoose.Types.ObjectId(user_id),
        cartItems: []
      });
    }

    const existingItemIndex = cart.cartItems.findIndex(
      item => item.product_id.toString() === product_id
    );

    if (existingItemIndex > -1) {
    
      cart.cartItems[existingItemIndex].quantity += Number(quantity);
    } else {
     
      cart.cartItems.push({ 
        product_id: mongoose.Types.ObjectId(product_id), 
        quantity: Number(quantity)
      });
    }

    await cart.save();
 
    await cart.populate('cartItems.product_id');
    
    res.status(200).json({ 
      message: 'Product added to cart successfully',
      cart
    });
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).json({ message: 'Error adding product to cart', error: err.message });
  }
});

router.get('/cart', async (req, res) => {
  try {
    const user_id = req.query.user_id || '6500000000000000000000aa';
    
    let cart = await Cart.findOne({ user_id }).populate('cartItems.product_id');
    
    if (!cart) {
      cart = new Cart({ 
        user_id: mongoose.Types.ObjectId(user_id),
        cartItems: []
      });
      await cart.save();
    }
    
    const total = cart.cartItems.reduce((sum, item) => {
      return sum + (item.quantity * (item.product_id?.price || 0));
    }, 0);
    
    res.json({
      cart,
      total
    });
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ message: 'Error fetching cart', error: err.message });
  }
});

router.post('/checkout', async (req, res) => {
  try {
    const user_id = req.body.user_id || '6500000000000000000000aa';
    
    const cart = await Cart.findOne({ user_id }).populate('cartItems.product_id');
    
    if (!cart || cart.cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    for (const item of cart.cartItems) {
      const product = await Product.findById(item.product_id);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for product: ${product ? product.name : 'Unknown product'}` 
        });
      }
    }

    const totalAmount = cart.cartItems.reduce((sum, item) => {
      return sum + (item.quantity * item.product_id.price);
    }, 0);

    const order = new Order({
      user_id,
      total_amount: totalAmount,
      status: 'pending'
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
      
      await Product.findByIdAndUpdate(
        item.product_id._id,
        { $inc: { stock: -item.quantity } }
      );
    }

    cart.cartItems = [];
    await cart.save();

    const completedOrder = await Order.findById(order._id).populate({
      path: 'orderItems',
      populate: { path: 'product_id' }
    });

    res.status(201).json({ 
      message: 'Order placed successfully', 
      order: completedOrder 
    });
  } catch (err) {
    console.error('Error during checkout:', err);
    res.status(500).json({ message: 'Error during checkout', error: err.message });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const user_id = req.query.user_id || '6500000000000000000000aa';
    
    let filter = { user_id };
    
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate);
      }
      
      if (req.query.endDate) {
        const endDate = new Date(req.query.endDate);
        endDate.setDate(endDate.getDate() + 1);
        filter.createdAt.$lt = endDate;
      }
    }
    
    // Get orders with populated order items and products
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate({
        path: 'orderItems',
        populate: { path: 'product_id' }
      });
    
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Error fetching orders', error: err.message });
  }
});

module.exports = router;
