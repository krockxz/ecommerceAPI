
const mongoose = require('mongoose');
const Product = require('./models/product');
const Cart = require('./models/cart');
const Order = require('./models/order');
const OrderItem = require('./models/orderItem');

const mongoURI = 'mongodb+srv://kunal:kunal@menudb.oljtc.mongodb.net/?retryWrites=true&w=majority&appName=menuDB';

mongoose.connect(mongoURI)
  .then(async () => {
    console.log('MongoDB connected');

    try {
      await Product.deleteMany({});
      await Cart.deleteMany({});
      await Order.deleteMany({});
      await OrderItem.deleteMany({});
      
      console.log('Cleared existing data');

      const products = await Product.insertMany([
        { name: 'Laptop', description: 'High-performance laptop', price: 1000, stock: 10 },
        { name: 'Smartphone', description: 'Latest model smartphone', price: 500, stock: 15 },
        { name: 'Headphones', description: 'Noise-canceling headphones', price: 150, stock: 20 },
        { name: 'Smartwatch', description: 'Fitness tracking smartwatch', price: 200, stock: 8 },
        { name: 'Tablet', description: '10-inch tablet with high resolution', price: 350, stock: 12 }
      ]);
      
      console.log('Sample products added');
      
      const userId = new mongoose.Types.ObjectId();
      
      const cart = new Cart({
        user_id: userId,
        cartItems: [
          { product_id: products[0]._id, quantity: 1 },
          { product_id: products[2]._id, quantity: 2 }
        ]
      });
      
      await cart.save();
      console.log('Sample cart added');

      const order = new Order({
        user_id: userId,
        total_amount: 450,
        status: 'completed'
      });
      
      await order.save();
      
      await OrderItem.insertMany([
        { 
          order_id: order._id, 
          product_id: products[1]._id, 
          quantity: 1, 
          price: products[1].price 
        },
        { 
          order_id: order._id, 
          product_id: products[3]._id, 
          quantity: 1, 
          price: products[3].price 
        }
      ]);
      
      console.log('Sample order added');
      console.log('Sample data loaded successfully!');
      console.log('\nTry these API endpoints:');
      console.log('- GET http://localhost:3000/api/products');
      console.log('- GET http://localhost:3000/api/cart?user_id=' + userId);
      console.log('- GET http://localhost:3000/api/orders?user_id=' + userId);
      
    } catch (error) {
      console.error('Error creating sample data:', error);
    }
    
    process.exit();
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB', err);
    process.exit(1);
  });
