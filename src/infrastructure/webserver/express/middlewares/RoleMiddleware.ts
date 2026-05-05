import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./AuthMiddleware";

export const requireRole = (allowedRoles: ("owner" | "admin" | "worker")[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !req.user.role) {
      res.status(401).json({ error: "Usuário não autenticado ou sem permissões" });
      return;
    }

    if (!allowedRoles.includes(req.user.role as any)) {
      res.status(403).json({ error: "Acesso negado: permissão insuficiente" });
      return;
    }

    next();
  };
};
