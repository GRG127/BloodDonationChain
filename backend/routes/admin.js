const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get system stats
router.get('/stats', async (req, res) => {
    try {
        const stats = {
            totalDonors: await User.countDocuments({ role: 'donor' }),
            totalRecipients: await User.countDocuments({ role: 'recipient' }),
            totalHospitals: await User.countDocuments({ role: 'hospital' }),
            pendingHospitals: await User.countDocuments({ 
                role: 'hospital', 
                'hospitalInfo.verificationStatus': 'pending' 
            })
        };
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all hospitals
router.get('/hospitals', async (req, res) => {
    try {
        const hospitals = await User.find({ role: 'hospital' })
            .select('profile hospitalInfo walletAddress createdAt');
        res.json(hospitals);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update hospital verification status
router.put('/hospitals/:id/verify', async (req, res) => {
    try {
        const hospital = await User.findByIdAndUpdate(
            req.params.id,
            { 
                $set: { 
                    'hospitalInfo.verificationStatus': req.body.status 
                } 
            },
            { new: true }
        );
        res.json(hospital);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 