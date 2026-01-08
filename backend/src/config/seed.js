import bcrypt from 'bcrypt';
import { emailExists, createUser, getByEmail } from '../models/users.model.js';
import { query } from './db.js';

export const seedDemo = async () => {
  const demoUsers = [
    { name: 'Admin', email: 'admin@store.com', password: 'Admin@123', role: 'admin' },
    { name: 'John', email: 'john@email.com', password: 'User@123', role: 'user' },
    { name: 'Mike', email: 'mike@store.com', password: 'Store@123', role: 'store_owner' },
  ];

  const shouldReset = process.env.DEMO_RESET
    ? process.env.DEMO_RESET === 'true'
    : (process.env.NODE_ENV !== 'production');

  for (const du of demoUsers) {
    const existing = await getByEmail(du.email);
    const hashed = await bcrypt.hash(du.password, 10);

    if (!existing) {
      await createUser({ name: du.name, email: du.email, password: hashed, role: du.role });
      if (process.env.NODE_ENV !== 'production') {
        console.log(`Seeded demo user: ${du.email} (${du.role})`);
      }
    } else if (shouldReset) {
      await query('UPDATE users SET password=$1 WHERE email=$2', [hashed, du.email.toLowerCase()]);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`Reset password for demo user: ${du.email}`);
      }
    }
  }
};
