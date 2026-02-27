const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Monitor = require('../models/Monitor');
const Log = require('../models/Log');

// Get analytics stats for the logged-in user
router.get('/', auth, async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const { timeRange } = req.query; // '24h', '7d', '30d', '90d'

        // Determine date filter based on timeRange
        let fromDate = new Date();
        let durationMs = 7 * 24 * 60 * 60 * 1000;
        
        if (timeRange === '24h') durationMs = 24 * 60 * 60 * 1000;
        else if (timeRange === '7d') durationMs = 7 * 24 * 60 * 60 * 1000;
        else if (timeRange === '30d') durationMs = 30 * 24 * 60 * 60 * 1000;
        else if (timeRange === '90d') durationMs = 90 * 24 * 60 * 60 * 1000;
        
        fromDate = new Date(Date.now() - durationMs);
        const prevFromDate = new Date(fromDate.getTime() - durationMs);

        // 1. Get monitors
        const monitors = await Monitor.find({ userId });
        const monitorIds = monitors.map(m => m._id);

        if (monitorIds.length === 0) {
            return res.json({
                slaStats: { current: 100, target: 99.9, trend: 0, totalUptime: "0h 0m", totalDowntime: "0h 0m", incidentCount: 0, mttr: "0m", mtbf: "0m" },
                responseTimeDistribution: [],
                incidentTimeline: [],
                downtimeEvents: [],
                responseTimeData: [],
                uptimeData: [],
                percentiles: { p50: 0, p90: 0, p99: 0 },
                insights: { commonFailure: 'None', peakDowntime: 'N/A', recoveryTrend: 'Stable' }
            });
        }

        // 2. Aggregate SLA Stats for Current and Previous periods
        const getSla = async (start, end) => {
            const stats = await Log.aggregate([
                { $match: { monitorId: { $in: monitorIds }, checkedAt: { $gte: start, $lt: end } } },
                { $group: {
                    _id: null,
                    total: { $sum: 1 },
                    up: { $sum: { $cond: [ { $eq: ["$status", "UP"] }, 1, 0 ] } }
                }}
            ]);
            if (!stats[0] || stats[0].total === 0) return 100;
            return (stats[0].up / stats[0].total) * 100;
        };

        const currentSla = await getSla(fromDate, new Date());
        const prevSla = await getSla(prevFromDate, fromDate);
        const slaTrend = (currentSla - prevSla).toFixed(2);

        // 3. Latency Percentiles
        const rtLogs = await Log.find({ monitorId: { $in: monitorIds }, checkedAt: { $gte: fromDate }, status: 'UP' }, 'responseTime')
            .sort({ responseTime: 1 })
            .lean();
        
        const getPercentile = (arr, p) => {
            if (arr.length === 0) return 0;
            const idx = Math.floor((p / 100) * arr.length);
            return arr[idx]?.responseTime || 0;
        };

        const percentiles = {
            p50: getPercentile(rtLogs, 50),
            p90: getPercentile(rtLogs, 90),
            p99: getPercentile(rtLogs, 99)
        };

        // 4. Incident History & MTBF
        const allLogs = await Log.find({ monitorId: { $in: monitorIds }, checkedAt: { $gte: fromDate } })
            .sort({ checkedAt: 1 })
            .populate('monitorId', 'name');

        const activeIncidents = {};
        const resolvedIncidents = [];
        let totalDowntimesMs = 0;
        let lastCheckedMap = {};

        allLogs.forEach(log => {
            const mId = log.monitorId._id.toString();
            if (log.status === 'DOWN' && !activeIncidents[mId]) {
                activeIncidents[mId] = log;
            } else if (log.status === 'UP' && activeIncidents[mId]) {
                const start = activeIncidents[mId];
                const duration = log.checkedAt - start.checkedAt;
                totalDowntimesMs += duration;
                resolvedIncidents.push({
                    monitorName: start.monitorId.name,
                    startedAt: start.checkedAt,
                    endedAt: log.checkedAt,
                    duration
                });
                delete activeIncidents[mId];
            }
            lastCheckedMap[mId] = log.checkedAt;
        });

        // MTBF: Average time between failures
        let mtbfStr = "N/A";
        if (resolvedIncidents.length > 1) {
            let totalGaps = 0;
            for (let i = 1; i < resolvedIncidents.length; i++) {
                totalGaps += resolvedIncidents[i].startedAt - resolvedIncidents[i-1].endedAt;
            }
            const avgGap = totalGaps / (resolvedIncidents.length - 1);
            const days = Math.floor(avgGap / (24*3600000));
            const hrs = Math.floor((avgGap % (24*3600000)) / 3600000);
            mtbfStr = days > 0 ? `${days}d ${hrs}h` : `${hrs}h`;
        }

        // 5. Insights
        const hourCounts = new Array(24).fill(0);
        allLogs.filter(l => l.status === 'DOWN').forEach(l => hourCounts[new Date(l.checkedAt).getHours()]++);
        const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
        
        // 6. Response Distribution
        const rtAggregate = await Log.aggregate([
             { $match: { monitorId: { $in: monitorIds }, checkedAt: { $gte: fromDate }, status: 'UP' } },
             { $group: {
                  _id: {
                      $switch: {
                          branches: [
                              { case: { $lte: ["$responseTime", 100] }, then: "0-100ms" },
                              { case: { $lte: ["$responseTime", 300] }, then: "100-300ms" },
                              { case: { $lte: ["$responseTime", 500] }, then: "300-500ms" },
                              { case: { $lte: ["$responseTime", 1000] }, then: "500-1s" }
                          ],
                          default: "1s+"
                      }
                  },
                  count: { $sum: 1 }
             }}
        ]);
        
        const distributionMap = { '0-100ms': 0, '100-300ms': 0, '300-500ms': 0, '500-1s': 0, '1s+': 0 };
        rtAggregate.forEach(item => distributionMap[item._id] = item.count);
        const responseTimeDistribution = Object.keys(distributionMap).map(range => ({ range, count: distributionMap[range] }));

        // 7. Bucketing for Charts
        const buckets = 24;
        const bucketSize = durationMs / buckets;
        const responseTimeData = [];
        const uptimeData = [];

        for (let i = 0; i < buckets; i++) {
            const bStart = new Date(fromDate.getTime() + i * bucketSize);
            const bEnd = new Date(fromDate.getTime() + (i + 1) * bucketSize);
            
            const stats = await Log.aggregate([
                { $match: { monitorId: { $in: monitorIds }, checkedAt: { $gte: bStart, $lt: bEnd } } },
                { $group: {
                    _id: null,
                    avgRT: { $avg: "$responseTime" },
                    up: { $sum: { $cond: [{ $eq: ["$status", "UP"] }, 1, 0] } },
                    total: { $sum: 1 }
                }}
            ]);

            const label = bStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            responseTimeData.push({ time: label, value: stats[0] ? Math.round(stats[0].avgRT) : 0 });
            uptimeData.push({ date: label, uptime: stats[0] ? Math.round((stats[0].up / stats[0].total) * 100) : 100 });
        }

        const formatDuration = (ms) => {
            const hours = Math.floor(ms / 3600000);
            const minutes = Math.floor((ms % 3600000) / 60000);
            return `${hours}h ${minutes}m`;
        };

        res.json({
            slaStats: {
                current: parseFloat(currentSla.toFixed(2)),
                target: 99.9,
                trend: parseFloat(slaTrend),
                totalUptime: formatDuration(rtLogs.length * 60000),
                totalDowntime: formatDuration(totalDowntimesMs),
                incidentCount: resolvedIncidents.length,
                mttr: resolvedIncidents.length > 0 ? Math.round((totalDowntimesMs / resolvedIncidents.length) / 60000) + "m" : "0m",
                mtbf: mtbfStr
            },
            percentiles,
            insights: {
                commonFailure: resolvedIncidents.length > 0 ? "Timeout (Connection)" : "Service Stable",
                peakDowntime: resolvedIncidents.length > 0 ? `${peakHour}:00 - ${peakHour + 1}:00` : "None recorded",
                recoveryTrend: "Consistent"
            },
            responseTimeDistribution,
            incidentTimeline: resolvedIncidents.slice(-10).reverse().map(inc => ({
                id: `inc_${inc.startedAt.getTime()}`,
                monitorName: inc.monitorName,
                type: 'resolved',
                message: `Resolved after ${Math.round(inc.duration/60000)}m`,
                timestamp: new Date(inc.endedAt).toLocaleString()
            })),
            downtimeEvents: resolvedIncidents.slice(-5).reverse().map(inc => ({
                id: `evt_${inc.startedAt.getTime()}`,
                monitorName: inc.monitorName,
                startedAt: new Date(inc.startedAt).toLocaleString(),
                endedAt: new Date(inc.endedAt).toLocaleString(),
                duration: Math.round(inc.duration/60000) + "m",
                reason: "Timeout"
            })),
            responseTimeData,
            uptimeData
        });
        
    } catch (error) {
        console.error("Analytics API Error:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
