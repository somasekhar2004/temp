// filename: server/src/scripts/seedAdmin.ts
import bcrypt from 'bcrypt';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';
import { env } from '../config/env';

const args = process.argv.slice(2);
const getArg = (name: string): string | undefined => {
  const arg = args.find(a => a.startsWith(`--${name}=`));
  return arg ? arg.split('=')[1] : undefined;
};

async function seed() {
  const email = getArg('email') || process.env.SEED_ADMIN_EMAIL || 'admin@quizarena.com';
  const password = getArg('password') || process.env.SEED_ADMIN_PASSWORD || 'Admin@123!';
  const name = getArg('name') || process.env.SEED_ADMIN_NAME || 'QuizArena Admin';

  console.log('🌱 Starting admin seed process...');
  console.log(`Email: ${email}`);
  console.log(`Name: ${name}`);

  try {
    await connectDB();

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log(`⚠️ User with email "${email}" already exists.`);
      if (existingUser.role === 'admin') {
        console.log('✅ The existing user is already an admin. No action taken.');
      } else {
        console.log(`🔄 Updating existing user's role to 'admin'...`);
        existingUser.role = 'admin';
        existingUser.status = 'active';
        await existingUser.save();
        console.log('✅ Existing user promoted to admin successfully.');
      }
      return;
    }

    const passwordHash = await bcrypt.hash(password, env.BCRYPT_COST);
    const adminUser = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: 'admin',
      status: 'active',
    });

    console.log(`✅ Admin user created successfully with ID: ${adminUser._id}`);
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
  } finally {
    await disconnectDB();
  }
}

seed();
