const express = require('express');
const app = express();
const mongoose = require('mongoose');
const apiRoutes = require('./routes/api');
require('./config/db'); 

app.use(express.json());
app.use('/api', apiRoutes);

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
