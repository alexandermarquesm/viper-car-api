import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./AuthMiddleware";
import { ITenantRepository } from "../../../../application/repositories/ITenantRepository";

export const createSubscriptionMiddleware = (tenantRepository: ITenantRepository) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: "Usuário não autenticado" });
      return;
    }

    try {
      const tenant = await tenantRepository.findById(req.user.tenantId);

      if (!tenant) {
        res.status(404).json({ error: "Tenant não encontrado" });
        return;
      }

      // Se o plano for trial e já expirou
      const now = new Date();
      const isTrialExpired = tenant.plan === "trial" && tenant.trialEndsAt < now;
      
      // Se a assinatura for mensal e o status não for ativo, só bloqueia se o período de faturamento também já tiver acabado
      const isSubscriptionInactive = 
        tenant.plan === "monthly" && 
        tenant.subscriptionStatus !== "active" &&
        (!tenant.currentPeriodEnd || new Date(tenant.currentPeriodEnd) < now);

      if (isTrialExpired || isSubscriptionInactive) {
        res.status(403).json({ 
          error: "Assinatura necessária", 
          code: "SUBSCRIPTION_REQUIRED",
          trialEndsAt: tenant.trialEndsAt 
        });
        return;
      }

      next();
    } catch (err) {
      res.status(500).json({ error: "Erro ao verificar assinatura" });
      return;
    }
  };
};
