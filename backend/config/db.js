const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('\n❌ MongoDB Connection Failed!');
        console.error('Error:', error.message);
        console.error('\n📝 Quick Fix:');
        console.error('1. Install MongoDB: https://www.mongodb.com/try/download/community');
        console.error('2. OR use MongoDB Atlas (free): https://www.mongodb.com/cloud/atlas');
        console.error('3. Update MONGODB_URI in backend/.env\n');
        process.exit(1);
    }
};

module.exports = connectDB;
