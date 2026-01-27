require('dotenv').config();
const mongoose = require('mongoose');

const resetDatabase = async () => {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('✅ Connected to MongoDB');
        console.log('⚠️  WARNING: This will DELETE ALL DATA from the database!');
        console.log('📊 Database:', mongoose.connection.name);

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        console.log(`\n🗑️  Found ${collections.length} collections to delete:`);
        collections.forEach(collection => {
            console.log(`   - ${collection.collectionName}`);
        });

        console.log('\n🔥 Deleting all collections...\n');

        // Drop all collections
        for (const collection of collections) {
            await collection.drop();
            console.log(`✅ Deleted: ${collection.collectionName}`);
        }

        console.log('\n✨ Database reset complete!');
        console.log('📝 All collections have been deleted.');
        console.log('\n💡 Next steps:');
        console.log('   1. Restart the backend server');
        console.log('   2. Admin user will be auto-created');
        console.log('   3. You can start fresh!\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error resetting database:', error.message);
        process.exit(1);
    }
};

// Run the reset
resetDatabase();
