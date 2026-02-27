const axios = require('axios');
const Log = require('../models/Log');

// Worker function to ping a single monitor's URL
const processMonitor = async (monitor) => {
    const startTime = Date.now();
    try {
        console.log(`Pinging monitor: ${monitor.url}`);
        
        // Build Axios options based on monitor settings
        const options = {
            method: monitor.httpMethod || 'GET',
            url: monitor.url,
            timeout: monitor.timeout ? monitor.timeout * 1000 : 30000,
            validateStatus: () => true // Resolve all statuses so we can validate manually
        };

        if (monitor.customHeaders) {
            try {
                options.headers = JSON.parse(monitor.customHeaders);
            } catch (e) {
                console.error(`Invalid custom headers for monitor ${monitor._id}`);
            }
        }

        const response = await axios(options);
        const responseTime = Date.now() - startTime;
        
        // Validation Logic
        let isUp = true;
        let downReason = null;

        if (monitor.expectedStatusCode && response.status !== monitor.expectedStatusCode) {
            isUp = false;
            downReason = `Expected status ${monitor.expectedStatusCode}, got ${response.status}`;
        }

        if (isUp && monitor.keywordCheck && response.data) {
            const bodyString = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
            if (!bodyString.includes(monitor.keywordCheck)) {
                isUp = false;
                downReason = `Keyword "${monitor.keywordCheck}" not found in response`;
            }
        }
        
        if (isUp) {
            console.log(`[UP] ${monitor.url} - ${responseTime}ms`);
            await Log.create({
                monitorId: monitor._id,
                status: 'UP',
                responseTime,
                checkedAt: new Date()
            });
        } else {
            console.log(`[DOWN/FAIL] ${monitor.url} - ${downReason} - ${responseTime}ms`);
            await Log.create({
                monitorId: monitor._id,
                status: 'DOWN',
                responseTime,
                checkedAt: new Date()
            });
        }

    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.log(`[DOWN] ${monitor.url} - ${error.message} - ${responseTime}ms`);
        
        // Log it as DOWN in the database
        await Log.create({
            monitorId: monitor._id,
            status: 'DOWN',
            responseTime,
            checkedAt: new Date()
        });
    } finally {
        // Calculate the next run time by adding the interval (in minutes) to current time
        monitor.nextRunAt = new Date(Date.now() + monitor.interval * 60 * 1000); 
        await monitor.save();
    }
};

module.exports = { processMonitor };
