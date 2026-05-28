import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./AuthMiddleware";

export const activeUserMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: "Usuário não autenticado" });
    return;
  }

  if (req.user.status !== "active") {
    res.status(403).json({ error: "Acesso bloqueado. Seu cadastro está aguardando aprovação do administrador do lava-rápido." });
    return;
  }

  next();
};
