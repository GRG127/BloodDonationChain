require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection with IPv4 and updated options
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/blood-donation-chain', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    family: 4 // Force IPv4
}).then(() => {
    console.log('Connected to MongoDB successfully');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

// Import routes
const authRoutes = require('./routes/auth');
const donorRoutes = require('./routes/donor');
const recipientRoutes = require('./routes/recipient');
const hospitalRoutes = require('./routes/hospital');
const adminRoutes = require('./routes/admin');


app.use('/api/auth', authRoutes);
app.use('/api/donor', donorRoutes);
app.use('/api/recipient', recipientRoutes);
app.use('/api/hospital', hospitalRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 