const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');

// Middleware for input validation
const registerValidation = [
    check('email').isEmail().normalizeEmail(),
    check('password').isLength({ min: 6 }),
    check('role').isIn(['donor', 'recipient', 'hospital']),
    check('walletAddress').isEthereumAddress(),
    check('profile.name').notEmpty(),
    check('profile.bloodGroup').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
];

// Register new user
router.post('/register', registerValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, role, walletAddress, profile } = req.body;

        // Check if user already exists with the same email
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Check if wallet address is already in use
        let walletUser = await User.findOne({ walletAddress });
        if (walletUser) {
            return res.status(400).json({ 
                message: 'This wallet address is already registered. One wallet address can only be used once.',
                code: 'DUPLICATE_WALLET'
            });
        }

        // Create new user
        user = new User({
            email,
            password,
            role,
            walletAddress,
            profile
        });

        await user.save();

        // Create JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                profile: user.profile
            }
        });
    } catch (error) {
        console.error(error);
        
        // Check if this is a duplicate key error
        if (error.code === 11000) {
            if (error.keyPattern && error.keyPattern.walletAddress) {
                return res.status(400).json({ 
                    message: 'This wallet address is already registered. One wallet address can only be used once.',
                    code: 'DUPLICATE_WALLET'
                });
            } else if (error.keyPattern && error.keyPattern.email) {
                return res.status(400).json({ 
                    message: 'User with this email already exists',
                    code: 'DUPLICATE_EMAIL'
                });
            }
        }
        
        res.status(500).json({ message: 'Server error' });
    }
});

// Login user
router.post('/login', [
    check('email').isEmail(),
    check('password').exists()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Validate password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                profile: user.profile
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 