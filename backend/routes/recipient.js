const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/profile', async (req, res) => {
    try {
        const recipient = await User.findById(req.user.userId);
        if (!recipient) {
            return res.status(404).json({ message: 'Recipient not found' });
        }
        res.json(recipient);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update recipient profile
router.put('/profile', async (req, res) => {
    try {
        const recipient = await User.findByIdAndUpdate(
            req.user.userId,
            { $set: { profile: req.body } },
            { new: true }
        );
        res.json(recipient);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get blood requests
router.get('/requests', async (req, res) => {
    try {
        const recipient = await User.findById(req.user.userId);
        res.json(recipient.requests || []);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 