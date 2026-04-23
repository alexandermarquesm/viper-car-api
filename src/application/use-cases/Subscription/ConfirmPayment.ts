import { ITenantRepository } from "../../repositories/ITenantRepository";

interface ConfirmPaymentRequest {
  tenantId: string;
  externalCustomerId: string;
  externalSubscriptionId: string;
  variantId: string;
}

export class ConfirmPayment {
  constructor(private tenantRepository: ITenantRepository) {}

  async execute(request: ConfirmPaymentRequest): Promise<void> {
    const { tenantId, externalCustomerId, externalSubscriptionId, variantId } = request;

    const tenant = await this.tenantRepository.findById(tenantId);

    if (!tenant) {
      throw new Error("Tenant não encontrado para confirmação de pagamento");
    }

    tenant.plan = "monthly";
    tenant.subscriptionStatus = "active";
    tenant.externalCustomerId = externalCustomerId;
    tenant.externalSubscriptionId = externalSubscriptionId;
    tenant.variantId = variantId;

    await this.tenantRepository.save(tenant);
  }
}
