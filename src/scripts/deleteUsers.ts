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
      console.error('❌ ERROR: User admin@lavagem.com not found! Aborting deletion to prevent total data loss.');
      process.exit(1);
    }

    const adminTenantId = adminUser.tenantId;
    console.log(`🔑 ADMIN FOUND: admin@lavagem.com | Tenant ID: ${adminTenantId}`);

    // 2. Fetch all other users
    const allUsers = await usersCol.find({}).toArray();
    const usersToDelete = allUsers.filter(u => u.email !== 'admin@lavagem.com');

    if (usersToDelete.length === 0) {
      console.log('No other users found to delete.');
      process.exit(0);
    }

    console.log(`🗑️ Starting deletion of ${usersToDelete.length} users and their isolated data...\n`);

    let totalWashesDeleted = 0;
    let totalClientsDeleted = 0;
    let totalExpensesDeleted = 0;
    let totalInvitesDeleted = 0;
    let totalTenantsDeleted = 0;
    let totalUsersDeleted = 0;

    for (const u of usersToDelete) {
      const isSameTenant = adminTenantId && String(u.tenantId) === String(adminTenantId);

      // If they are in an isolated tenant, clean up all tenant-level data
      if (!isSameTenant && u.tenantId) {
        const washesDel = await washesCol.deleteMany({ tenantId: u.tenantId });
        const clientsDel = await clientsCol.deleteMany({ tenantId: u.tenantId });
        const expensesDel = await expensesCol.deleteMany({ tenantId: u.tenantId });
        const invitesDel = await invitesCol.deleteMany({ tenantId: u.tenantId });
        const tenantDel = await tenantsCol.deleteOne({ _id: u.tenantId });

        totalWashesDeleted += washesDel.deletedCount;
        totalClientsDeleted += clientsDel.deletedCount;
        totalExpensesDeleted += expensesDel.deletedCount;
        totalInvitesDeleted += invitesDel.deletedCount;
        if (tenantDel.deletedCount > 0) totalTenantsDeleted++;
        
        console.log(`🧹 Cleaned up isolated Tenant data for user: ${u.email} | Tenant ID: ${u.tenantId}`);
      }

      // Delete the user themselves
      const userDel = await usersCol.deleteOne({ _id: u._id });
      if (userDel.deletedCount > 0) totalUsersDeleted++;
    }

    console.log('\n✨ DELETION COMPLETE SUMMARY:');
    console.log(`👥 Users deleted: ${totalUsersDeleted}`);
    console.log(`🏢 Tenants deleted: ${totalTenantsDeleted}`);
    console.log(`🚗 Washes deleted: ${totalWashesDeleted}`);
    console.log(`👤 Clients deleted: ${totalClientsDeleted}`);
    console.log(`💸 Expenses deleted: ${totalExpensesDeleted}`);
    console.log(`✉️ Invites deleted: ${totalInvitesDeleted}`);

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();
