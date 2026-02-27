const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Monitor = require('../models/Monitor');
const Log = require('../models/Log');

// Get dashboard stats for the logged-in user
router.get('/', auth, async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const { timeRange } = req.query; // '24h', '7d', '30d'

        // Determine date filter
        let fromDate = new Date();
        if (timeRange === '7d') fromDate.setDate(fromDate.getDate() - 7);
        else if (timeRange === '30d') fromDate.setDate(fromDate.getDate() - 30);
        else fromDate.setHours(fromDate.getHours() - 24); // Default 24h
        
        // 1. Get monitors
        const monitors = await Monitor.find({ userId });
        const monitorIds = monitors.map(m => m._id);

        if (monitorIds.length === 0) {
            return res.json({
                stats: {
                    totalMonitors: 0, activeMonitors: 0, downMonitors: 0,
                    avgResponseTime: 0, uptimePercentage: 100,
                    incidentsToday: 0, fastestResponse: 0, slowestResponse: 0,
                    distribution: { fast: 0, average: 0, slow: 0 },
                    incidentTimeline: [], lastAlert: "Add a monitor to start"
                },
                statusLogs: [],
                responseTimeData: []
            });
        }

        // 2. Aggregate latest statuses
        const latestStatuses = await Log.aggregate([
            { $match: { monitorId: { $in: monitorIds } } },
            { $sort: { checkedAt: -1 } },
            { 
                $group: {
                    _id: "$monitorId",
                    status: { $first: "$status" },
                    responseTime: { $first: "$responseTime" }
                }
            }
        ]);

        let activeMonitors = 0;
        let downMonitors = 0;
        let totalResponseTime = 0;
        let monitorsWithLogs = 0;

        latestStatuses.forEach(state => {
             if (state.status === 'UP') {
                 activeMonitors++;
                 totalResponseTime += (state.responseTime || 0);
                 monitorsWithLogs++;
             } else {
                 downMonitors++;
             }
        });
        
        // Count disabled monitors as "down" for the stats
        const reportedIds = latestStatuses.map(s => s._id.toString());
        monitors.forEach(m => {
             if (!m.enabled && !reportedIds.includes(m._id.toString())) {
                 downMonitors++;
             }
        });

        const avgResponseTime = monitorsWithLogs > 0 ? Math.round(totalResponseTime / monitorsWithLogs) : 0;
        
        // 3. Aggregate total uptime percentage
        const countScores = await Log.aggregate([
             { $match: { monitorId: { $in: monitorIds }, checkedAt: { $gte: fromDate } } },
             { $group: {
                  _id: null,
                  total: { $sum: 1 },
                  up: { $sum: { $cond: [ { $eq: ["$status", "UP"] }, 1, 0 ] } }
             }}
        ]);
        
        let uptimePercentage = 100;
        if (countScores.length > 0 && countScores[0].total > 0) {
             uptimePercentage = ((countScores[0].up / countScores[0].total) * 100).toFixed(2);
        }

        // 4. Distribution (ALL logs in time range)
        const distributionAggregate = await Log.aggregate([
            { $match: { monitorId: { $in: monitorIds }, checkedAt: { $gte: fromDate }, status: 'UP' } },
            {
                $group: {
                    _id: null,
                    fast: { $sum: { $cond: [{ $lte: ["$responseTime", 500] }, 1, 0] } },
                    average: { $sum: { $cond: [{ $and: [{ $gt: ["$responseTime", 500] }, { $lte: ["$responseTime", 1000] }] }, 1, 0] } },
                    slow: { $sum: { $cond: [{ $gt: ["$responseTime", 1000] }, 1, 0] } }
                }
            }
        ]);

        const distribution = distributionAggregate[0] || { fast: 0, average: 0, slow: 0 };

        // 5. Extremes
        let fastestResponse = 0;
        let slowestResponse = 0;
        const upLogs = latestStatuses.filter(s => s.status === 'UP');
        if (upLogs.length > 0) {
            fastestResponse = Math.min(...upLogs.map(s => s.responseTime || 0));
            slowestResponse = Math.max(...upLogs.map(s => s.responseTime || 0));
        }

        // 6. Incident Timeline (Detect transitions correctly per monitor)
        const timelineLogs = await Log.find({ monitorId: { $in: monitorIds } })
            .sort({ checkedAt: -1 })
            .limit(100)
            .populate('monitorId', 'name');

        const incidentTimeline = [];
        const lastSeenStatus = {}; // { monitorId: 'UP' }

        for (const log of timelineLogs) {
            const mId = log.monitorId._id.toString();
            if (lastSeenStatus[mId] && lastSeenStatus[mId] !== log.status) {
                // Change detected from the *previous* log (which is chronologically later)
                incidentTimeline.push({
                    id: log._id,
                    monitorName: log.monitorId.name,
                    status: lastSeenStatus[mId], // What it changed TO
                    timestamp: new Date(log.checkedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    fullDate: log.checkedAt
                });
            }
            lastSeenStatus[mId] = log.status;
            if (incidentTimeline.length >= 8) break;
        }

        // 7. Recent logs for table
        const recentLogs = await Log.find({ monitorId: { $in: monitorIds } })
            .sort({ checkedAt: -1 })
            .limit(15)
            .populate('monitorId', 'name expectedStatusCode');
        
        const formattedLogs = recentLogs.map(log => ({
            id: log._id,
            monitorName: log.monitorId?.name || 'Unknown',
            status: log.status === 'UP' ? 'up' : 'down',
            responseTime: log.responseTime,
            statusCode: log.monitorId?.expectedStatusCode || 200,
            timestamp: new Date(log.checkedAt).toLocaleString()
        }));

        // 8. Sequential Response Time Chart Data
        const chartLogs = await Log.aggregate([
            { $match: { monitorId: { $in: monitorIds }, checkedAt: { $gte: fromDate } } },
            { $sort: { checkedAt: -1 } },
            { $limit: 40 },
            { $sort: { checkedAt: 1 } }
        ]);
            
        const responseTimeData = chartLogs.map(log => ({
            time: new Date(log.checkedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            value: log.responseTime
        }));

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const incidentsToday = await Log.countDocuments({
            monitorId: { $in: monitorIds },
            status: 'DOWN',
            checkedAt: { $gte: startOfToday }
        });

        res.json({
            stats: {
                totalMonitors: monitors.length,
                activeMonitors,
                downMonitors,
                avgResponseTime,
                uptimePercentage: parseFloat(uptimePercentage),
                incidentsToday,
                fastestResponse,
                slowestResponse,
                distribution,
                incidentTimeline,
                lastAlert: incidentsToday > 0 ? "Critical events active" : "Monitoring stable"
            },
            statusLogs: formattedLogs,
            responseTimeData
        });
        
    } catch (error) {
        console.error("Dashboard API Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Force a re-check for all monitors
router.post('/recheck', auth, async (req, res) => {
    try {
        await Monitor.updateMany({ userId: req.user.id }, { $set: { nextRunAt: new Date() } });
        res.json({ message: 'Re-check triggered for all monitors' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
