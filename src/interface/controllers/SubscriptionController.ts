import { Response } from "express";
import { AuthenticatedRequest } from "../../infrastructure/webserver/express/middlewares/AuthMiddleware";
import { CreateCheckout } from "../../application/use-cases/Subscription/CreateCheckout";

export class SubscriptionController {
  constructor(private createCheckout: CreateCheckout) {}

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
}
