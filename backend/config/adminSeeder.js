const bcrypt = require('bcryptjs');
const User = require('../models/User');

const createAdminUser = async () => {
    try {
        // Check if admin already exists
        const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });

        if (adminExists) {
            console.log('Admin user already exists');
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, salt);

        // Create admin user
        await User.create({
            name: 'Admin',
            email: process.env.ADMIN_EMAIL,
            password: hashedPassword,
            role: 'admin',
            isVerified: true,
            isSubAdmin: false
        });

        console.log('Admin user created successfully');
    } catch (error) {
        console.error('Error creating admin user:', error);
    }
};

module.exports = createAdminUser;
