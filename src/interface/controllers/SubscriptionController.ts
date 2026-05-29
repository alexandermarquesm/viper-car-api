import { Response } from "express";
import { AuthenticatedRequest } from "../../infrastructure/webserver/express/middlewares/AuthMiddleware";
import { CreateCheckout } from "../../application/use-cases/Subscription/CreateCheckout";
import { CreateCustomerPortal } from "../../application/use-cases/Subscription/CreateCustomerPortal";

export class SubscriptionController {
  constructor(
    private createCheckout: CreateCheckout,
    private createCustomerPortal: CreateCustomerPortal
  ) {}

  async checkout(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user || !req.user.tenantId) {
      res.status(401).json({ error: "Usuário não autenticado ou sem tenantId." });
      return;
    }

    const plan = req.body?.plan === "pro" ? "pro" : "basic";

    try {
      const { checkoutUrl } = await this.createCheckout.execute({
        tenantId: req.user.tenantId,
        plan,
      });

      res.status(200).json({ url: checkoutUrl });
    } catch (error: any) {
      console.error("[SubscriptionController] Erro ao gerar checkout:", error.message);
      res.status(500).json({ error: "Não foi possível gerar a sessão de checkout no momento. Verifique se o servidor está configurado corretamente." });
    }
  }

  async portal(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user || !req.user.tenantId) {
      res.status(401).json({ error: "Usuário não autenticado ou sem tenantId." });
      return;
    }

    try {
      const { portalUrl } = await this.createCustomerPortal.execute({
        tenantId: req.user.tenantId,
      });

      res.status(200).json({ url: portalUrl });
    } catch (error: any) {
      console.error("[SubscriptionController] Erro ao gerar portal:", error.message);
      res.status(400).json({ error: error.message || "Não foi possível gerar a sessão do portal no momento." });
    }
  }
}
