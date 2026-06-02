import Stripe from "stripe";
import { loadEnv } from "../../../main/config/env";

interface CreateCheckoutRequest {
  tenantId: string;
  plan: "basic" | "pro";
}

interface CreateCheckoutResponse {
  checkoutUrl: string;
}

export class CreateCheckout {
  async execute(request: CreateCheckoutRequest): Promise<CreateCheckoutResponse> {
    const { tenantId, plan } = request;
    const env = loadEnv();

    const secretKey = env.STRIPE_SECRET_KEY;
    const priceIdBasic = env.STRIPE_PRICE_ID_BASIC;
    const priceIdPro = env.STRIPE_PRICE_ID_PRO;

    if (!secretKey || !priceIdBasic || !priceIdPro) {
      console.error("[CreateCheckout] ERRO: Variáveis do Stripe não configuradas.");
      throw new Error("Configuração de pagamento incompleta no servidor.");
    }

    const stripe = new Stripe(secretKey);
    const priceId = plan === "pro" ? priceIdPro : priceIdBasic;

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        // Deep link para reabrir o app após o pagamento
        success_url: "vipercar://success",
        cancel_url: "vipercar://cancel",
        // Passamos o tenantId e o plano nos metadados para o webhook
        metadata: {
          tenantId,
          plan,
        },
        subscription_data: {
          metadata: {
            tenantId,
            plan,
          },
        },
      });

      if (!session.url) {
        throw new Error("Stripe não retornou a URL de checkout.");
      }

      return { checkoutUrl: session.url };
    } catch (error: any) {
      console.error("[CreateCheckout] Exceção:", error.message);
      throw error;
    }
  }
}
