const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['donor', 'recipient', 'hospital', 'admin'],
        required: true
    },
    walletAddress: {
        type: String,
        required: true,
    },
    profile: {
        name: {
            type: String,
            required: true
        },
        bloodGroup: {
            type: String,
            enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
            required: function() {
                return this.role === 'donor';
            }
        },
        location: String,
        phone: String,
        age: Number,
        gender: {
            type: String,
            enum: ['male', 'female', 'other']
        }
    },
    donorInfo: {
        lastDonationDate: Date,
        totalDonations: {
            type: Number,
            default: 0
        },
        rewardPoints: {
            type: Number,
            default: 0
        },
        eligibleToDonateSince: Date
    },
    hospitalInfo: {
        registrationNumber: String,
        verificationStatus: {
            type: String,
            enum: ['pending', 'verified', 'rejected'],
            default: 'pending'
        },
        bloodInventory: [{
            bloodGroup: String,
            quantity: Number,
            lastUpdated: Date
        }]
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastUpdated: Date
});

// Create a compound index for walletAddress and role
// This allows the same wallet address to be used with different roles
userSchema.index({ walletAddress: 1, role: 1 }, { unique: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    this.lastUpdated = new Date();
    next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User; 