const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Monitor = require('../models/Monitor');
const Log = require('../models/Log');

// Get incidents for the logged-in user
router.get('/', auth, async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        console.log(`[INCIDENTS] Fetching for user ${userId}`);
        
        // 1. Get monitors
        const monitors = await Monitor.find({ userId });
        const monitorIds = monitors.map(m => m._id);

        if (monitorIds.length === 0) {
            return res.json([]);
        }

        // Fetch logs sorted chronologically
        const statusTransitions = await Log.aggregate([
             { $match: { monitorId: { $in: monitorIds } } },
             { $sort: { checkedAt: 1 } },
             { $project: { status: 1, checkedAt: 1, monitorId: 1 } }
        ]);

        // We populate manually after aggregating to keep the projection fast
        await Log.populate(statusTransitions, { path: 'monitorId', select: 'name expectedStatusCode' });

        const incidents = [];
        let activeIncidents = {};
        
        // Traverse status transitions to build incidents
        statusTransitions.forEach(log => {
             const mId = String(log.monitorId._id);
             
             if (log.status === 'DOWN') {
                  // If monitor goes down and we don't have an active incident for it, start one
                  if (!activeIncidents[mId]) {
                      const rootCause = log.monitorId && log.monitorId.expectedStatusCode 
                          ? `Unexpected Status or Timeout` 
                          : 'Service Unavailable';
                          
                      activeIncidents[mId] = {
                          id: log._id.toString(), // Use the log ID as the incident ID
                          status: 'Unresolved',
                          monitorName: log.monitorId ? log.monitorId.name : 'Unknown',
                          rootCause: rootCause,
                          comments: 0, // Mocked field for UI completeness
                          started: new Date(log.checkedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) + ' GMT+5:30', // Approximating GMT+5:30 based on user's timezone request or screenshot format
                          _startedAt: new Date(log.checkedAt),
                          resolved: '-',
                          _resolvedAt: null,
                          duration: 'Ongoing',
                          visibility: 'Included'
                      };
                  }
             } else if (log.status === 'UP') {
                  // If monitor comes up and there is an active incident, resolve it
                  if (activeIncidents[mId]) {
                      const incident = activeIncidents[mId];
                      incident.status = 'Resolved';
                      
                      const resolvedDate = new Date(log.checkedAt);
                      incident._resolvedAt = resolvedDate;
                      incident.resolved = resolvedDate.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) + ' GMT+5:30';
                      
                      const durationMs = resolvedDate - incident._startedAt;
                      
                      let durationStr = "";
                      const hours = Math.floor(durationMs / 3600000);
                      const minutes = Math.floor((durationMs % 3600000) / 60000);
                      const seconds = Math.floor((durationMs % 60000) / 1000);
                      
                      if (hours > 0) durationStr += `${hours}h `;
                      if (minutes > 0 || hours > 0) durationStr += `${minutes}m `;
                      durationStr += `${seconds}s`;
                      
                      incident.duration = durationStr;
                      
                      incidents.push(incident);
                      delete activeIncidents[mId]; // Clear active incident
                  }
             }
        });
        
        // Add any remaining active incidents (ongoing)
        Object.values(activeIncidents).forEach(incident => {
             incidents.push(incident);
        });
        
        // Final cleanup and sort by newest first
        const formattedIncidents = incidents.sort((a,b) => b._startedAt - a._startedAt).map(inc => {
             const { _startedAt, _resolvedAt, ...rest } = inc;
             return rest;
        });

        res.json(formattedIncidents);
        
    } catch (error) {
        console.error("Incidents API Error:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
