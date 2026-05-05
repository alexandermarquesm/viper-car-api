import { Request, Response } from "express";
import crypto from "crypto";
import { ConfirmPayment } from "../../application/use-cases/Subscription/ConfirmPayment";
import { loadEnv } from "../../main/config/env";
import WebhookEventModel from "../../infrastructure/database/mongoose-models/WebhookEventModel";

export class WebhookController {
  constructor(private confirmPayment: ConfirmPayment) {}

  async handleLemonSqueezy(req: Request, res: Response): Promise<void> {
    const env = loadEnv();
    const secret = env.LEMON_SQUEEZY_WEBHOOK_SECRET;
    
    if (!secret) {
      console.error("[Webhook] Erro Crítico: LEMON_SQUEEZY_WEBHOOK_SECRET não configurado.");
      res.status(500).json({ error: "Webhook secret não configurado" });
      return;
    }

    const hmac = crypto.createHmac("sha256", secret);
    const digest = Buffer.from(hmac.update(req.body).digest("hex"), "utf8");
    const signature = Buffer.from(req.get("X-Signature") || "", "utf8");

    if (!crypto.timingSafeEqual(digest, signature)) {
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

    const eventId = payload.meta?.custom_data?.event_id || payload.meta?.event_id || req.get("X-Event-Id");
    
    if (eventId) {
      // Verificação de idempotência
      const alreadyProcessed = await WebhookEventModel.findOne({ eventId });
      if (alreadyProcessed) {
        console.log(`[Webhook] Evento já processado: ${eventId}`);
        res.status(200).send("OK");
        return;
      }
    }

    const eventName = payload.meta?.event_name;
    const customData = payload.meta?.custom_data;

    // Apenas processamos eventos de assinatura
    const allowedEvents = ["subscription_created", "subscription_updated", "subscription_cancelled", "subscription_expired", "order_created"];
    if (allowedEvents.includes(eventName)) {
      const tenantId = customData?.tenantId;
      const externalCustomerId = String(payload.data?.attributes?.customer_id);
      const externalSubscriptionId = String(payload.data?.id);
      const variantId = String(payload.data?.attributes?.variant_id);
      
      const renewsAt = payload.data?.attributes?.renews_at;
      const endsAt = payload.data?.attributes?.ends_at;
      const currentPeriodEndStr = renewsAt || endsAt;
      const currentPeriodEnd = currentPeriodEndStr ? new Date(currentPeriodEndStr) : undefined;
      const status = payload.data?.attributes?.status;

      if (tenantId) {
        try {
          await this.confirmPayment.execute({
            tenantId,
            externalCustomerId,
            externalSubscriptionId,
            variantId,
            currentPeriodEnd,
            status
          });
          console.log(`[Webhook] Assinatura processada para o Tenant: ${tenantId} | Status: ${status}`);
          
          if (eventId) {
            await WebhookEventModel.create({ eventId });
          }
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
