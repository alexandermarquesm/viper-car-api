import Stripe from "stripe";
import { loadEnv } from "../../../main/config/env";

interface CreateCheckoutRequest {
  tenantId: string;
  plan: "basic" | "pro";
  redirectUrl?: string;
  apiBaseUrl: string;
}

interface CreateCheckoutResponse {
  checkoutUrl: string;
}

export class CreateCheckout {
  async execute(request: CreateCheckoutRequest): Promise<CreateCheckoutResponse> {
    const { tenantId, plan, redirectUrl, apiBaseUrl } = request;
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
      let finalSuccessUrl = "vipercar://success";
      let finalCancelUrl = "vipercar://cancel";

      if (redirectUrl) {
        const isDev = env.NODE_ENV !== "production";
        const isValidAppScheme = redirectUrl.startsWith("vipercar://");
        const isValidExpoScheme = isDev && (redirectUrl.startsWith("exp://") || redirectUrl.startsWith("http://localhost") || redirectUrl.startsWith("http://192.168."));

        if (isValidAppScheme || isValidExpoScheme) {
          finalSuccessUrl = redirectUrl;
          finalCancelUrl = redirectUrl.replace("success", "cancel");
        } else {
          console.warn(`[CreateCheckout] URL de redirecionamento rejeitada por segurança: ${redirectUrl}`);
        }
      }

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        allow_promotion_codes: true,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: finalSuccessUrl,
        cancel_url: finalCancelUrl,
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
