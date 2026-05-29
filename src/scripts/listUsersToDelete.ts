import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function run() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('MONGO_URI not found in .env');
      process.exit(1);
    }
    
    await mongoose.connect(mongoUri);
    console.log('Successfully connected to MongoDB.\n');

    const db = mongoose.connection.db;
    if (!db) throw new Error('Database connection not established');

    const usersCol = db.collection('users');
    const tenantsCol = db.collection('tenants');
    const washesCol = db.collection('washes');
    const clientsCol = db.collection('clients');
    const expensesCol = db.collection('expenses');
    const invitesCol = db.collection('invites');

    // 1. Find the admin user
    const adminUser = await usersCol.findOne({ email: 'admin@lavagem.com' });
    if (!adminUser) {
      console.log('⚠️ WARNING: User admin@lavagem.com not found in the database!');
    } else {
      console.log(`🔑 FOUND ADMIN: admin@lavagem.com | Tenant ID: ${adminUser.tenantId}\n`);
    }

    const adminTenantId = adminUser ? adminUser.tenantId : null;

    // 2. Fetch all other users
    const allUsers = await usersCol.find({}).toArray();
    const usersToDelete = allUsers.filter(u => u.email !== 'admin@lavagem.com');

    console.log('--- USERS LIST TO BE DELETED ---');
    if (usersToDelete.length === 0) {
      console.log('No users to delete (only admin exists).');
      process.exit(0);
    }

    for (const u of usersToDelete) {
      const tenant = await tenantsCol.findOne({ _id: u.tenantId });
      const isSameTenant = adminTenantId && String(u.tenantId) === String(adminTenantId);

      console.log(`👤 User: ${u.name} (${u.email})`);
      console.log(`   - ID: ${u._id}`);
      console.log(`   - Role: ${u.role} | Status: ${u.status}`);
      console.log(`   - Tenant: ${tenant ? tenant.name : 'None'} (${u.tenantId}) ${isSameTenant ? '⭐️ [Shared with Admin]' : '❌ [Isolated Tenant]'}`);
      
      if (!isSameTenant && u.tenantId) {
        // Count related documents that will be deleted
        const washesCount = await washesCol.countDocuments({ tenantId: u.tenantId });
        const clientsCount = await clientsCol.countDocuments({ tenantId: u.tenantId });
        const expensesCount = await expensesCol.countDocuments({ tenantId: u.tenantId });
        const invitesCount = await invitesCol.countDocuments({ tenantId: u.tenantId });

        console.log(`   - Related items to be removed:`);
        console.log(`     🔹 Washes: ${washesCount}`);
        console.log(`     🔹 Clients: ${clientsCount}`);
        console.log(`     🔹 Expenses: ${expensesCount}`);
        console.log(`     🔹 Invites: ${invitesCount}`);
      } else {
        console.log(`   - Related items to be removed:`);
        console.log(`     🔹 (No tenant-level data will be deleted because they share the admin's tenant)`);
      }
      console.log('--------------------------------');
    }

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();
