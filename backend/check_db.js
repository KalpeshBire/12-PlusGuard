require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB.");
    const users = await User.find({});
    console.log("--- USERS IN DATABASE ---");
    if (users.length === 0) {
      console.log("No users found in the database.");
    } else {
      users.forEach(u => {
        console.log(`- Name: ${u.name} | Email: ${u.email} | Google ID: ${u.googleId || 'None'}`);
      });
    }
    console.log("-------------------------");
    process.exit(0);
  })
  .catch(err => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  });
