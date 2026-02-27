const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db');
const { startScheduler } = require('./services/scheduler');
const authRoutes = require('./routes/auth');
const monitorRoutes = require('./routes/monitors');
const dashboardRoutes = require('./routes/dashboard');
const analyticsRoutes = require('./routes/analytics');
const incidentsRoutes = require('./routes/incidents');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/monitors', monitorRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/incidents', incidentsRoutes);
app.use('/api/exports', require('./routes/exports'));

connectDB().then(() => {
    console.log('Starting Scheduler Engine...');
    startScheduler(); // Start the loop for checking websites
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
