const mongoose = require('mongoose');

const mongoURI = 'mongodb+srv://kunal:kunal@menudb.oljtc.mongodb.net/?retryWrites=true&w=majority&appName=menuDB';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.log('Failed to connect to MongoDB', err);
  });
