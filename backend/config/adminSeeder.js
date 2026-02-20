const bcrypt = require('bcryptjs');
const User = require('../models/User');

const createAdminUser = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        // Skip if env vars not set
        if (!adminEmail || !adminPassword) {
            console.log('⚠️ ADMIN_EMAIL or ADMIN_PASSWORD not set, skipping admin creation');
            return;
        }

        // Check if admin already exists
        const adminExists = await User.findOne({ email: adminEmail });

        if (adminExists) {
            console.log('✅ Admin user already exists');
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        // Create admin user
        await User.create({
            name: 'Admin',
            email: adminEmail,
            password: hashedPassword,
            role: 'admin',
            isVerified: true,
            isSubAdmin: false
        });

        console.log('✅ Admin user created successfully');
    } catch (error) {
        // Don't crash server if admin creation fails
        console.error('⚠️ Error creating admin user:', error.message);
    }
};

module.exports = createAdminUser;
