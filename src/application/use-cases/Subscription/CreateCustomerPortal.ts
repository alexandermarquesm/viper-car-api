import Stripe from "stripe";
import { loadEnv } from "../../../main/config/env";
import { ITenantRepository } from "../../repositories/ITenantRepository";

interface CreateCustomerPortalRequest {
  tenantId: string;
}

interface CreateCustomerPortalResponse {
  portalUrl: string;
}

export class CreateCustomerPortal {
  constructor(private tenantRepository: ITenantRepository) {}

  async execute(request: CreateCustomerPortalRequest): Promise<CreateCustomerPortalResponse> {
    const { tenantId } = request;
    const env = loadEnv();

    const secretKey = env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      console.error("[CreateCustomerPortal] ERRO: STRIPE_SECRET_KEY não configurada.");
      throw new Error("Configuração de pagamento incompleta no servidor.");
    }

    const tenant = await this.tenantRepository.findById(tenantId);
    if (!tenant) {
      throw new Error("Tenant não encontrado.");
    }

    if (!tenant.externalCustomerId) {
      throw new Error("Você não possui uma assinatura ativa para gerenciar.");
    }

    const stripe = new Stripe(secretKey);

    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: tenant.externalCustomerId,
        return_url: "vipcar://success", // Redireciona de volta para o app
      });

      if (!session.url) {
        throw new Error("Stripe não retornou a URL do portal.");
      }

      return { portalUrl: session.url };
    } catch (error: any) {
      console.error("[CreateCustomerPortal] Exceção:", error.message);
      throw error;
    }
  }
}
