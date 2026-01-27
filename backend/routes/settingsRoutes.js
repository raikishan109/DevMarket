const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// @route   GET /api/settings/payment-options
// @desc    Get public payment options (crypto addresses and UPI IDs)
// @access  Public
router.get('/payment-options', async (req, res) => {
    try {
        let settings = await Settings.findOne();

        if (!settings) {
            settings = await Settings.create({
                platformCommission: 10,
                cryptoAddresses: [],
                upiIds: []
            });
        }

        res.json({
            success: true,
            cryptoAddresses: settings.cryptoAddresses || [],
            upiIds: settings.upiIds || []
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching payment options'
        });
    }
});

module.exports = router;
