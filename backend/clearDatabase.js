const mongoose = require('mongoose');

async function clearDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/dev-marketplace');

        console.log('Connected to MongoDB');

        // Drop the entire database
        await mongoose.connection.dropDatabase();

        console.log('✅ Database cleared successfully!');
        console.log('All collections have been deleted.');
        console.log('The admin user will be recreated when you restart the server.');

        process.exit(0);
    } catch (error) {
        console.error('Error clearing database:', error);
        process.exit(1);
    }
}

clearDatabase();
