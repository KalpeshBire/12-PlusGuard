const Monitor = require('../models/Monitor');
const { processMonitor } = require('./worker');
const cron = require('node-cron');

let isRunning = false;

const startScheduler = () => {
    console.log('Scheduler Loop started...');
    
    // 1. Existing interval-based scheduler for dynamic monitor polling
    // Poll the database every 10 seconds to see if any websites need pinging
    setInterval(async () => {
        // Prevent overlap if pings take longer than 10s combined
        if (isRunning) return; 
        isRunning = true;
        
        try {
            const now = new Date();
            
            // Find monitors that are active AND have a nextRunAt time scheduled for right now or in the past
            const monitorsToRun = await Monitor.find({ 
                enabled: true, 
                nextRunAt: { $lte: now } 
            });
            
            if (monitorsToRun.length > 0) {
                console.log(`Found ${monitorsToRun.length} sites to check.`);
            }
            
            // Ping them concurrently. Promise.allSettled runs them all in parallel
            // and won't fail the whole batch if one ping crashes.
            const promises = monitorsToRun.map(monitor => processMonitor(monitor));
            await Promise.allSettled(promises);
            
        } catch (error) {
            console.error('Scheduler DB query error:', error);
        } finally {
            isRunning = false;
        }
    }, 10000); // 10s loop

    // 2. New node-cron implementation for fixed-interval background tasks
    // This runs every 10 minutes
    cron.schedule('*/10 * * * *', () => {
        console.log(`[${new Date().toISOString()}] Cron Heartbeat: Running scheduled 10-minute task...`);
        // Add additional system maintenance tasks here if needed
    });

    console.log('Cron 10-minute task registered.');
};

module.exports = { startScheduler };
