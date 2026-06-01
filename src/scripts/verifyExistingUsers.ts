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

    // Atualiza todos os usuários existentes para isEmailVerified = true
    const result = await usersCol.updateMany(
      { isEmailVerified: { $exists: false } },
      { $set: { isEmailVerified: true } }
    );

    console.log(`✅ Migração concluída com sucesso!`);
    console.log(`➡️ Usuários modificados: ${result.modifiedCount}`);
    
    // Mostra todos os usuários e seus status de e-mail atualizados
    const allUsers = await usersCol.find({}).toArray();
    console.log('\n=========================================');
    console.log('📋 ESTADO ATUAL DE TODOS OS USUÁRIOS:');
    allUsers.forEach(u => {
      console.log(`- Nome: ${u.name} | E-mail: ${u.email} | Verificado: ${u.isEmailVerified}`);
    });
    console.log('=========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Ocorreu um erro na migração:', error);
    process.exit(1);
  }
}

run();
