import { loadEnv } from "../../../main/config/env";

interface CreateCheckoutRequest {
  tenantId: string;
}

interface CreateCheckoutResponse {
  checkoutUrl: string;
}

export class CreateCheckout {
  async execute(request: CreateCheckoutRequest): Promise<CreateCheckoutResponse> {
    const { tenantId } = request;
    const env = loadEnv();
    
    const apiKey = env.LEMON_SQUEEZY_API_KEY;
    const storeId = env.LEMON_SQUEEZY_STORE_ID;
    const variantId = env.LEMON_SQUEEZY_VARIANT_ID;

    if (!apiKey || !storeId || !variantId) {
      console.error("[CreateCheckout] ERRO: Variáveis do LemonSqueezy não configuradas.");
      throw new Error("Configuração de pagamento incompleta no servidor.");
    }

    const payload = {
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            custom: {
              tenantId: tenantId
            }
          }
        },
        relationships: {
          store: {
            data: {
              type: "stores",
              id: storeId
            }
          },
          variant: {
            data: {
              type: "variants",
              id: variantId
            }
          }
        }
      }
    };

    try {
      const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
        method: "POST",
        headers: {
          "Accept": "application/vnd.api+json",
          "Content-Type": "application/vnd.api+json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[CreateCheckout] Erro na API LemonSqueezy:", errorText);
        throw new Error("Falha ao se comunicar com o gateway de pagamento.");
      }

      const responseData = (await response.json()) as any;
      const checkoutUrl = responseData.data?.attributes?.url;

      if (!checkoutUrl) {
        throw new Error("Gateway de pagamento não retornou a URL de checkout.");
      }

      return { checkoutUrl };
    } catch (error: any) {
      console.error("[CreateCheckout] Exceção:", error.message);
      throw error;
    }
  }
}
