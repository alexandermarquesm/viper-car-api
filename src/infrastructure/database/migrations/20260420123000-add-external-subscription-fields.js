module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    console.log("Adicionando campos de assinatura externa na coleção 'tenants'...");

    // Adicionar campos (opcional, como MongoDB é schemaless, o principal é criar os índices)
    // Mas podemos inicializar se necessário.
    
    // Criar índices para performance nas buscas do Webhook
    // Removemos índices existentes sem 'sparse' se houver conflito
    try { await db.collection("tenants").dropIndex("externalCustomerId_1"); } catch (e) {}
    try { await db.collection("tenants").dropIndex("externalSubscriptionId_1"); } catch (e) {}

    await db.collection("tenants").createIndex({ externalCustomerId: 1 }, { sparse: true });
    await db.collection("tenants").createIndex({ externalSubscriptionId: 1 }, { sparse: true });

    console.log("Migração concluída com sucesso.");
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    console.log("Revertendo campos de assinatura externa...");
    
    await db.collection("tenants").dropIndex("externalCustomerId_1");
    await db.collection("tenants").dropIndex("externalSubscriptionId_1");
    
    await db.collection("tenants").updateMany({}, {
      $unset: {
        externalCustomerId: "",
        externalSubscriptionId: "",
        variantId: ""
      }
    });
  }
};
