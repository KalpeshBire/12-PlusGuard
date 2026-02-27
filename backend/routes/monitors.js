const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Monitor = require('../models/Monitor');
const Log = require('../models/Log');

// Get all monitors for the logged-in user with dynamic statuses and sparkline
router.get('/', auth, async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const monitors = await Monitor.find({ userId }).sort({ createdAt: -1 });
        
        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Dynamically fetch stats for each monitor
        const monitorsWithStats = await Promise.all(monitors.map(async (monitor) => {
            // Last 10 logs for sparkline
            const latestLogs = await Log.find({ monitorId: monitor._id })
                .sort({ checkedAt: -1 })
                .limit(10);
            
            const latestLog = latestLogs[0];
            const sparkline = latestLogs.map(l => l.responseTime || 0).reverse();

            // Incident count in last 24h (Simple transition check)
            const logs24h = await Log.find({ 
                monitorId: monitor._id, 
                checkedAt: { $gte: last24h } 
            }).sort({ checkedAt: 1 });

            let incidents24h = 0;
            let lastStatus = 'UP';
            logs24h.forEach(log => {
                if (log.status === 'DOWN' && lastStatus === 'UP') {
                    incidents24h++;
                }
                lastStatus = log.status;
            });

            // Calculate Uptime (SLA)
            const upCount = logs24h.filter(l => l.status === 'UP').length;
            const sla = logs24h.length > 0 ? (upCount / logs24h.length) * 100 : 100;

            let currentStatus = 'warning';
            let responseTime = 0;
            let lastChecked = 'Never';

            if (latestLog) {
                currentStatus = latestLog.status === 'UP' ? 'up' : 'down';
                responseTime = latestLog.responseTime;
                lastChecked = latestLog.checkedAt;
            } else if (!monitor.enabled) {
                currentStatus = 'down';
            }

            return {
                id: monitor._id,
                url: monitor.url,
                name: monitor.name,
                status: currentStatus,
                interval: monitor.interval,
                lastChecked,
                uptime: sla.toFixed(2),
                responseTime,
                alertEmail: monitor.alertEmail || '',
                enabled: monitor.enabled,
                httpMethod: monitor.httpMethod,
                customHeaders: monitor.customHeaders || '',
                timeout: monitor.timeout,
                expectedStatusCode: monitor.expectedStatusCode,
                keywordCheck: monitor.keywordCheck || '',
                sparkline,
                incidents24h
            };
        }));
        
        res.json(monitorsWithStats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new monitor
router.post('/', auth, async (req, res) => {
    try {
        const { 
            url, name, interval, enabled, alertEmail, 
            httpMethod, customHeaders, timeout, 
            expectedStatusCode, keywordCheck 
        } = req.body;
        
        const newMonitor = new Monitor({
            userId: req.user.id,
            url,
            name,
            interval: interval || 5,
            enabled: enabled !== undefined ? enabled : true,
            alertEmail,
            httpMethod,
            customHeaders,
            timeout,
            expectedStatusCode,
            keywordCheck,
            nextRunAt: new Date()
        });
        
        await newMonitor.save();
        res.status(201).json(newMonitor);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Run a manual check for a specific monitor
router.post('/:id/recheck', auth, async (req, res) => {
    try {
        const monitor = await Monitor.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { $set: { nextRunAt: new Date() } },
            { new: true }
        );
        if (!monitor) return res.status(404).json({ msg: 'Monitor not found' });
        res.json({ message: 'Re-check triggered', monitor });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a monitor
router.put('/:id', auth, async (req, res) => {
    try {
        const updatedMonitor = await Monitor.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { $set: req.body },
            { new: true }
        );
        if (!updatedMonitor) return res.status(404).json({ msg: 'Monitor not found' });
        res.json(updatedMonitor);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a monitor
router.delete('/:id', auth, async (req, res) => {
    try {
        const monitor = await Monitor.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!monitor) return res.status(404).json({ msg: 'Monitor not found' });
        res.json({ message: 'Monitor deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Pause all monitors for the user
router.post('/pause-all', auth, async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        console.log(`[PAUSE] Pausing all monitors for user ${userId}`);
        const result = await Monitor.updateMany({ userId }, { $set: { enabled: false } });
        console.log(`[PAUSE] Success: ${result.modifiedCount} updated`);
        res.json({ message: 'All monitors paused', count: result.modifiedCount });
    } catch (error) {
        console.error('[PAUSE] Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Resume all monitors for the user
router.post('/resume-all', auth, async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        console.log(`[RESUME] Resuming all monitors for user ${userId}`);
        const result = await Monitor.updateMany({ userId }, { $set: { enabled: true } });
        console.log(`[RESUME] Success: ${result.modifiedCount} updated`);
        res.json({ message: 'All monitors resumed', count: result.modifiedCount });
    } catch (error) {
        console.error('[RESUME] Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
