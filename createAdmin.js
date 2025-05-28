const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

const { User } = require('./model/User');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);

    const adminEmail = 'admin@example.com';

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      process.exit(0);
    }

    const plainPassword = 'AdminPassword123';

    // Generate salt
    const salt = crypto.randomBytes(16);

    // Hash password with pbkdf2
    crypto.pbkdf2(plainPassword, salt, 310000, 32, 'sha256', async (err, hashedPassword) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }

      const adminUser = new User({
        name: 'Admin User',
        email: adminEmail,
        password: hashedPassword,  // Buffer
        salt: salt,                // Buffer
        role: 'admin',
      });

      await adminUser.save();
      console.log('Admin user created successfully!');
      process.exit(0);
    });

  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdmin();


