import Stripe from "stripe";
import { loadEnv } from "../../../main/config/env";

interface CreateCheckoutRequest {
  tenantId: string;
  plan: "basic" | "pro";
  currency?: string; // "BRL" | "USD" | "EUR"
  redirectUrl?: string;
  apiBaseUrl: string;
}

interface CreateCheckoutResponse {
  checkoutUrl: string;
}

export class CreateCheckout {
  async execute(request: CreateCheckoutRequest): Promise<CreateCheckoutResponse> {
    const { tenantId, plan, currency, redirectUrl, apiBaseUrl } = request;
    const env = loadEnv();

    const secretKey = env.STRIPE_SECRET_KEY;
    const priceIdBasicBRL = env.STRIPE_PRICE_ID_BASIC;
    const priceIdProBRL = env.STRIPE_PRICE_ID_PRO;
    const priceIdBasicUSD = env.STRIPE_PRICE_ID_BASIC_USD;
    const priceIdProUSD = env.STRIPE_PRICE_ID_PRO_USD;
    const priceIdBasicEUR = env.STRIPE_PRICE_ID_BASIC_EUR;
    const priceIdProEUR = env.STRIPE_PRICE_ID_PRO_EUR;

    if (!secretKey) {
      console.error("[CreateCheckout] ERRO: STRIPE_SECRET_KEY não configurada.");
      throw new Error("Configuração de pagamento incompleta no servidor.");
    }

    const stripe = new Stripe(secretKey);

    let priceId = "";
    const requestedCurrency = (currency || "BRL").toUpperCase();

    if (requestedCurrency === "USD") {
      priceId = plan === "pro" ? (priceIdProUSD || "") : (priceIdBasicUSD || "");
    } else if (requestedCurrency === "EUR") {
      priceId = plan === "pro" ? (priceIdProEUR || "") : (priceIdBasicEUR || "");
    }

    // Fallback para BRL
    if (!priceId) {
      priceId = plan === "pro" ? (priceIdProBRL || "") : (priceIdBasicBRL || "");
    }

    if (!priceId) {
      console.error(`[CreateCheckout] ERRO: Não foi possível determinar o Price ID para o plano ${plan} (${requestedCurrency}).`);
      throw new Error("Configuração de pagamento incompleta no servidor.");
    }

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
