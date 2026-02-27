const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Monitor = require('../models/Monitor');
const Log = require('../models/Log');

// Generate CSV export of logs for the user's monitors
router.get('/logs', auth, async (req, res) => {
    try {
        console.log(`[EXPORT] Generating logs for user ${req.user.id}`);
        const userId = new mongoose.Types.ObjectId(req.user.id);
        
        // Find all monitors for this user
        const monitors = await Monitor.find({ userId });
        const monitorIds = monitors.map(m => m._id);

        if (monitorIds.length === 0) {
            return res.status(404).json({ message: 'No monitors found for this user' });
        }

        // Fetch logs for these monitors (limit to last 1000 for performance)
        const logs = await Log.find({ monitorId: { $in: monitorIds } })
            .sort({ checkedAt: -1 })
            .limit(1000)
            .populate('monitorId', 'name url');

        // Build CSV content
        let csv = 'Monitor Name,URL,Status,Response Time (ms),Checked At\n';
        
        logs.forEach(log => {
            const monitorName = log.monitorId ? log.monitorId.name : 'Unknown';
            const url = log.monitorId ? log.monitorId.url : 'Unknown';
            const status = log.status;
            const rt = log.responseTime || 0;
            const time = new Date(log.checkedAt).toISOString();
            
            // Clean names/urls for CSV (rudimentary)
            const cleanName = monitorName.replace(/"/g, '""');
            const cleanUrl = url.replace(/"/g, '""');
            
            csv += `"${cleanName}","${cleanUrl}","${status}",${rt},"${time}"\n`;
        });

        // Set headers for file download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=pulseguard_logs.csv');
        res.status(200).send(csv);

    } catch (error) {
        console.error('Export Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
