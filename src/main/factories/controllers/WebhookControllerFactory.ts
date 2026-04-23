import { WebhookController } from "../../../interface/controllers/WebhookController";
import { ConfirmPayment } from "../../../application/use-cases/Subscription/ConfirmPayment";
import { MongooseTenantRepository } from "../../../interface/repositories/MongooseTenantRepository";

export const makeWebhookController = (): WebhookController => {
  const tenantRepository = new MongooseTenantRepository();
  const confirmPayment = new ConfirmPayment(tenantRepository);
  return new WebhookController(confirmPayment);
};
