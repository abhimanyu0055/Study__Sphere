const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const dns= require("dns"); 

dns.setServers(["1.1.1.1","8.8.8.8"]);

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Allows us to accept JSON data in the body

// Import Routes
const resourceRoutes = require('./routes/resourceRoutes');
const authRoutes = require('./routes/authRoutes');

// Use Routes
app.use('/api/resources', resourceRoutes);
app.use('/api/auth', authRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch((err) => console.log('Database Connection Failed:', err));

// Basic Test Route
app.get('/', (req, res) => {
  res.send('StudySphere API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));