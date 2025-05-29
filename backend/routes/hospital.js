const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get hospital profile
router.get('/profile', async (req, res) => {
    try {
        const hospital = await User.findById(req.user.userId);
        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found' });
        }
        res.json(hospital);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update hospital profile
router.put('/profile', async (req, res) => {
    try {
        const hospital = await User.findByIdAndUpdate(
            req.user.userId,
            { $set: { profile: req.body } },
            { new: true }
        );
        res.json(hospital);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get blood inventory
router.get('/inventory', async (req, res) => {
    try {
        const hospital = await User.findById(req.user.userId);
        res.json(hospital.hospitalInfo?.bloodInventory || []);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update blood inventory
router.put('/inventory', async (req, res) => {
    try {
        const hospital = await User.findByIdAndUpdate(
            req.user.userId,
            { 
                $set: { 
                    'hospitalInfo.bloodInventory': req.body.inventory 
                } 
            },
            { new: true }
        );
        res.json(hospital.hospitalInfo.bloodInventory);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 