import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function run() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ MONGO_URI não encontrada no arquivo .env');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Conectado com sucesso ao MongoDB.');

    const db = mongoose.connection.db;
    if (!db) throw new Error('Falha ao obter conexão com o banco de dados.');

    const usersCol = db.collection('users');
    const tenantsCol = db.collection('tenants');

    // 1. Encontrar o usuário admin
    const adminUser = await usersCol.findOne({ email: 'admin@lavagem.com' });
    if (!adminUser) {
      console.error('❌ ERRO: Usuário admin@lavagem.com não foi encontrado no banco!');
      process.exit(1);
    }

    const tenantId = adminUser.tenantId;
    if (!tenantId) {
      console.error('❌ ERRO: O usuário admin existe, mas não possui um tenantId associado!');
      process.exit(1);
    }

    console.log(`🔑 Admin encontrado: ${adminUser.email} | Tenant ID: ${tenantId}`);

    // 2. Atualizar o Tenant para o plano VIP PRO
    const result = await tenantsCol.updateOne(
      { _id: tenantId },
      {
        $set: {
          plan: 'monthly',
          subscriptionStatus: 'active',
          variantId: 'pro',
          trialEndsAt: new Date('2030-12-31T23:59:59.000Z'),
          currentPeriodEnd: new Date('2030-12-31T23:59:59.000Z'),
          status: 'active',
        }
      }
    );

    if (result.matchedCount === 0) {
      console.log('⚠️ Tenant não encontrado na coleção de tenants. Criando um novo...');
      await tenantsCol.insertOne({
        _id: tenantId,
        name: 'Lava-Rápido Admin',
        status: 'active',
        plan: 'monthly',
        subscriptionStatus: 'active',
        variantId: 'pro',
        trialEndsAt: new Date('2030-12-31T23:59:59.000Z'),
        currentPeriodEnd: new Date('2030-12-31T23:59:59.000Z'),
        createdAt: new Date(),
        creditCardFee: 3.09,
        debitCardFee: 0.89,
        inviteCode: 'VIP-ADMIN',
      });
      console.log('✅ Novo Tenant VIP PRO criado e ativado!');
    } else {
      console.log('✅ Tenant existente atualizado com sucesso para VIP PRO ativo!');
    }

    // 3. Exibir o estado final
    const updatedTenant = await tenantsCol.findOne({ _id: tenantId });
    console.log('\n=========================================');
    console.log('💎 ESTADO ATUAL DO INQUILINO (TENANT):');
    console.log(JSON.stringify(updatedTenant, null, 2));
    console.log('=========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Ocorreu um erro:', error);
    process.exit(1);
  }
}

run();
