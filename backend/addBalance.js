require('dotenv').config();
const mongoose = require('mongoose');

const addBalanceToUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const User = require('./models/User');
        const Transaction = require('./models/Transaction');

        const user = await User.findOne({ email: 'demo11@gmail.com' });

        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        console.log('Found user:', user.name, user.email);

        await Transaction.create({
            user: user._id,
            type: 'credit',
            amount: 5000,
            category: 'sale',
            description: 'Initial balance added',
            status: 'completed'
        });

        await User.findByIdAndUpdate(user._id, {
            $inc: { walletBalance: 5000 }
        });

        console.log('✅ Successfully added 5000 rs to wallet');

        const updatedUser = await User.findById(user._id);
        console.log('New balance:', updatedUser.walletBalance);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

addBalanceToUser();
