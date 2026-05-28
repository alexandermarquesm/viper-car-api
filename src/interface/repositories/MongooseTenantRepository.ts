import { Tenant } from "../../domain/entities/Tenant";
import { ITenantRepository } from "../../application/repositories/ITenantRepository";
import TenantModel from "../../infrastructure/database/mongoose-models/TenantModel";

export class MongooseTenantRepository implements ITenantRepository {
  async findByDocument(document: string): Promise<Tenant | null> {
    const doc = await TenantModel.findOne({ document });
    if (!doc) return null;
    return new Tenant({
      id: doc.id,
      name: doc.name,
      document: doc.document,
      status: doc.status as any,
      plan: doc.plan as any,
      subscriptionStatus: doc.subscriptionStatus as any,
      trialEndsAt: doc.trialEndsAt,
      createdAt: doc.createdAt,
      externalCustomerId: doc.externalCustomerId,
      externalSubscriptionId: doc.externalSubscriptionId,
      variantId: doc.variantId,
      currentPeriodEnd: doc.currentPeriodEnd,
      creditCardFee: doc.creditCardFee !== undefined ? doc.creditCardFee : 3.09,
      debitCardFee: doc.debitCardFee !== undefined ? doc.debitCardFee : 0.89,
      inviteCode: doc.inviteCode,
    });
  }

  async findByExternalCustomerId(externalCustomerId: string): Promise<Tenant | null> {
    const doc = await TenantModel.findOne({ externalCustomerId });
    if (!doc) return null;
    return new Tenant({
      id: doc.id,
      name: doc.name,
      document: doc.document,
      status: doc.status as any,
      plan: doc.plan as any,
      subscriptionStatus: doc.subscriptionStatus as any,
      trialEndsAt: doc.trialEndsAt,
      createdAt: doc.createdAt,
      externalCustomerId: doc.externalCustomerId,
      externalSubscriptionId: doc.externalSubscriptionId,
      variantId: doc.variantId,
      currentPeriodEnd: doc.currentPeriodEnd,
      creditCardFee: doc.creditCardFee !== undefined ? doc.creditCardFee : 3.09,
      debitCardFee: doc.debitCardFee !== undefined ? doc.debitCardFee : 0.89,
      inviteCode: doc.inviteCode,
    });
  }

  async findById(id: string): Promise<Tenant | null> {
    const doc = await TenantModel.findById(id);
    if (!doc) return null;
    return new Tenant({
      id: doc.id,
      name: doc.name,
      document: doc.document,
      status: doc.status as any,
      plan: doc.plan as any,
      subscriptionStatus: doc.subscriptionStatus as any,
      trialEndsAt: doc.trialEndsAt,
      createdAt: doc.createdAt,
      externalCustomerId: doc.externalCustomerId,
      externalSubscriptionId: doc.externalSubscriptionId,
      variantId: doc.variantId,
      currentPeriodEnd: doc.currentPeriodEnd,
      creditCardFee: doc.creditCardFee !== undefined ? doc.creditCardFee : 3.09,
      debitCardFee: doc.debitCardFee !== undefined ? doc.debitCardFee : 0.89,
      inviteCode: doc.inviteCode,
    });
  }

  async findByInviteCode(inviteCode: string): Promise<Tenant | null> {
    const doc = await TenantModel.findOne({ inviteCode: inviteCode.trim().toUpperCase() });
    if (!doc) return null;
    return new Tenant({
      id: doc.id,
      name: doc.name,
      document: doc.document,
      status: doc.status as any,
      plan: doc.plan as any,
      subscriptionStatus: doc.subscriptionStatus as any,
      trialEndsAt: doc.trialEndsAt,
      createdAt: doc.createdAt,
      externalCustomerId: doc.externalCustomerId,
      externalSubscriptionId: doc.externalSubscriptionId,
      variantId: doc.variantId,
      currentPeriodEnd: doc.currentPeriodEnd,
      creditCardFee: doc.creditCardFee !== undefined ? doc.creditCardFee : 3.09,
      debitCardFee: doc.debitCardFee !== undefined ? doc.debitCardFee : 0.89,
      inviteCode: doc.inviteCode,
    });
  }

  async save(tenant: Tenant): Promise<Tenant> {
    const doc = await TenantModel.findOneAndUpdate(
      { _id: tenant.id },
      {
        name: tenant.name,
        document: tenant.document,
        status: tenant.status,
        plan: tenant.plan,
        subscriptionStatus: tenant.subscriptionStatus,
        trialEndsAt: tenant.trialEndsAt,
        createdAt: tenant.createdAt,
        externalCustomerId: tenant.externalCustomerId,
        externalSubscriptionId: tenant.externalSubscriptionId,
        variantId: tenant.variantId,
        currentPeriodEnd: tenant.currentPeriodEnd,
        creditCardFee: tenant.creditCardFee,
        debitCardFee: tenant.debitCardFee,
        inviteCode: tenant.inviteCode,
      },
      { returnDocument: 'after', upsert: true }
    );
    return tenant;
  }
}
