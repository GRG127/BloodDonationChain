const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { ethers } = require('ethers');

// Get donor profile
router.get('/profile', async (req, res) => {
    try {
        const donor = await User.findById(req.user.userId);
        if (!donor) {
            return res.status(404).json({ message: 'Donor not found' });
        }
        res.json(donor);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update donor profile
router.put('/profile', async (req, res) => {
    try {
        const donor = await User.findByIdAndUpdate(
            req.user.userId,
            { $set: { profile: req.body } },
            { new: true }
        );
        res.json(donor);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get donation history
router.get('/donations', async (req, res) => {
    try {
        const donor = await User.findById(req.user.userId);
        res.json(donor.donorInfo || { totalDonations: 0, donations: [] });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 