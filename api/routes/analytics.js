// routes/analytics.js

const express = require('express');
const router = express.Router();
const apiKeyAuth = require('../middlewares/apiKeyAuth');

router.use(apiKeyAuth);

router.get('/usage', async (req, res) => {
    try {
        const apiKey = req.header('x-api-key');
        const keyRecord = await ApiKey.findOne({ key: apiKey });

        if (!keyRecord) {
            return res.status(404).json({ message: 'API key not found' });
        }

        res.json({
            usageCount: keyRecord.usageCount,
            endpointUsage: keyRecord.endpointUsage,
            lastUsed: keyRecord.lastUsed,
        });
    } catch (error) {
        console.error('Analytics retrieval error:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
