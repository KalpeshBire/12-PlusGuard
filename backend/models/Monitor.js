const mongoose = require('mongoose');

const monitorSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    url: { type: String, required: true },
    name: { type: String, required: true },
    interval: { type: Number, required: true, default: 5 }, // Interval in minutes
    enabled: { type: Boolean, default: true },
    alertEmail: { type: String },
    httpMethod: { type: String, enum: ['GET', 'POST', 'HEAD', 'PUT', 'DELETE'], default: 'GET' },
    customHeaders: { type: String },
    timeout: { type: Number, default: 30 },
    expectedStatusCode: { type: Number, default: 200 },
    keywordCheck: { type: String },
    nextRunAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Monitor', monitorSchema);
