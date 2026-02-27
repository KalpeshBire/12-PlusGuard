const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    monitorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Monitor' },
    status: { type: String, enum: ['UP', 'DOWN'], required: true },
    responseTime: { type: Number, required: true }, // in milliseconds
    checkedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Log', logSchema);
