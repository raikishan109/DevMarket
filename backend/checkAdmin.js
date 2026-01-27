const mongoose = require('mongoose');
const User = require('./models/User');

async function checkAdmin() {
    try {
        await mongoose.connect('mongodb://localhost:27017/dev-marketplace');

        console.log('Connected to MongoDB');

        const admins = await User.find({ role: 'admin' });

        console.log('\n=== Admin Users in Database ===');
        console.log('Total admins found:', admins.length);

        admins.forEach((admin, index) => {
            console.log(`\nAdmin ${index + 1}:`);
            console.log('  Name:', admin.name);
            console.log('  Email:', admin.email);
            console.log('  Role:', admin.role);
            console.log('  isSubAdmin:', admin.isSubAdmin);
            console.log('  Created:', admin.createdAt);
        });

        if (admins.length === 0) {
            console.log('\n⚠️ No admin users found in database!');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkAdmin();
