// populateData.js
const mongoose = require('mongoose');
const Product = require('./models/product');
const Cart = require('./models/cart');
const Order = require('./models/order');
const OrderItem = require('./models/orderItem');

// MongoDB connection URI
const mongoURI = 'mongodb+srv://kunal:kunal@menudb.oljtc.mongodb.net/?retryWrites=true&w=majority&appName=menuDB';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('MongoDB connected');

    // Create sample products
    const products = [
      { name: 'Laptop', description: 'High-performance laptop', price: 1000, stock: 10 },
      { name: 'Smartphone', description: 'Latest model smartphone', price: 500, stock: 15 },
      { name: 'Headphones', description: 'Noise-canceling headphones', price: 150, stock: 20 }
    ];

    // Insert products into the Product collection
    await Product.insertMany(products);
    console.log('Sample products added');

    // Create a sample cart
    const cart = new Cart({
      user_id: new mongoose.Types.ObjectId(),  // Dummy user ID
      cartItems: [
        { product_id: products[0]._id, quantity: 2 },
        { product_id: products[1]._id, quantity: 3 }
      ]
    });

    await cart.save();
    console.log('Sample cart added');

    // Create an order based on the cart
    const order = new Order({
      user_id: cart.user_id,
      total_amount: cart.cartItems.reduce((sum, item) => sum + (item.quantity * item.product_id.price), 0),
      status: 'pending'
    });

    await order.save();

    // Create order items based on the cart
    for (const item of cart.cartItems) {
      const orderItem = new OrderItem({
        order_id: order._id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product_id.price
      });
      await orderItem.save();
    }

    console.log('Sample order added');
    process.exit();
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB', err);
    process.exit(1);
  });
