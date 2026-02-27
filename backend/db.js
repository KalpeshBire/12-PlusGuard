const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Fallback to local MongoDB if MONGO_URI is missing
        const uri = process.env.MONGO_URI || 'mongodb+srv://knbire370124_db_user:lhlTtEt9HuuN9ue9@cluster0.veio4af.mongodb.net/pulseguard';
        await mongoose.connect(uri);
        console.log('MongoDB Connected successfully');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

module.exports = connectDB;
