import { Request, Response } from "express";
import crypto from "crypto";
import { ConfirmPayment } from "../../application/use-cases/Subscription/ConfirmPayment";
import { loadEnv } from "../../main/config/env";

export class WebhookController {
  constructor(private confirmPayment: ConfirmPayment) {}

  async handleLemonSqueezy(req: Request, res: Response): Promise<void> {
    const env = loadEnv();
    const secret = env.LEMON_SQUEEZY_WEBHOOK_SECRET;
    const hmac = crypto.createHmac("sha256", secret || "");
    const digest = Buffer.from(hmac.update(req.body).digest("hex"), "utf8");
    const signature = Buffer.from(req.get("X-Signature") || "", "utf8");

    if (secret && !crypto.timingSafeEqual(digest, signature)) {
      res.status(401).json({ error: "Assinatura inválida" });
      return;
    }

    let payload;
    try {
      payload = JSON.parse(req.body.toString());
    } catch (e) {
      res.status(400).json({ error: "Payload inválido" });
      return;
    }

    const eventName = payload.meta?.event_name;
    const customData = payload.meta?.custom_data;

    // Apenas processamos eventos de criação ou renovação de assinatura com sucesso
    if (eventName === "subscription_created" || eventName === "order_created") {
      const tenantId = customData?.tenantId;
      const externalCustomerId = String(payload.data?.attributes?.customer_id);
      const externalSubscriptionId = String(payload.data?.id);
      const variantId = String(payload.data?.attributes?.variant_id);

      if (tenantId) {
        try {
          await this.confirmPayment.execute({
            tenantId,
            externalCustomerId,
            externalSubscriptionId,
            variantId
          });
          console.log(`[Webhook] Assinatura confirmada para o Tenant: ${tenantId}`);
        } catch (error: any) {
          console.error(`[Webhook] Erro ao confirmar pagamento: ${error.message}`);
          res.status(500).json({ error: "Erro ao processar ativação" });
          return;
        }
      }
    }

    res.status(200).send("OK");
  }
}
