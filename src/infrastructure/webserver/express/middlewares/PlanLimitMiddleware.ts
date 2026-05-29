import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./AuthMiddleware";
import { ITenantRepository } from "../../../../application/repositories/ITenantRepository";

export const createPlanLimitMiddleware = (tenantRepository: ITenantRepository) => {
  return (feature: "reports" | "expenses" | "ocr") => {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
      if (!req.user) {
        res.status(401).json({ error: "Usuário não autenticado" });
        return;
      }

      try {
        const tenant = await tenantRepository.findById(req.user.tenantId);

        if (!tenant) {
          res.status(404).json({ error: "Empresa não encontrada" });
          return;
        }

        let hasAccess = false;
        if (feature === "reports") {
          hasAccess = tenant.canAccessReports();
        } else if (feature === "expenses") {
          hasAccess = tenant.canAccessExpenses();
        } else if (feature === "ocr") {
          hasAccess = tenant.canAccessOCR();
        }

        if (!hasAccess) {
          res.status(403).json({
            error: `Seu plano atual não tem acesso a esta funcionalidade (${feature}). Faça upgrade para o plano PRO para desbloquear.`,
            code: "UPGRADE_REQUIRED",
            feature
          });
          return;
        }

        next();
      } catch (err) {
        console.error("[PlanLimitMiddleware] Erro ao verificar plano:", err);
        res.status(500).json({ error: "Erro ao verificar permissão do plano" });
        return;
      }
    };
  };
};
