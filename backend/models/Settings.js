const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    platformCommission: {
        type: Number,
        default: 10,
        min: 0,
        max: 100
    },
    cryptoAddresses: [{
        type: String,
        trim: true
    }],
    upiIds: [{
        type: String,
        trim: true
    }],
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Settings', settingsSchema);
