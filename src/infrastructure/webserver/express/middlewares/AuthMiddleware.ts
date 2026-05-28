import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { IUserRepository } from "../../../../application/repositories/IUserRepository";
import { ITenantRepository } from "../../../../application/repositories/ITenantRepository";

export interface AuthenticatedRequest<
  P = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: {
    id: string;
    email: string;
    tenantId: string;
    role: string;
    status: string;
  };
}

export const createAuthMiddleware = (jwtSecret: string, userRepository: IUserRepository, tenantRepository: ITenantRepository) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: "Token não fornecido" });
      return;
    }

    const [, token] = authHeader.split(" ");

    try {
      const decoded = jwt.verify(token, jwtSecret) as any;
      
      // Busca ultraleve no banco para garantir que o usuário ainda existe e está ativo ou pendente
      const user = await userRepository.findById(decoded.id);
      
      if (!user) {
        res.status(401).json({ error: "Usuário não encontrado no banco de dados" });
        return;
      }

      if (user.status !== "active" && user.status !== "pending") {
        res.status(401).json({ error: "Usuário inativo ou banido" });
        return;
      }
      
      if (decoded.tokenVersion !== undefined && decoded.tokenVersion !== user.tokenVersion) {
        res.status(401).json({ error: "Sessão expirada ou revogada" });
        return;
      }

      const tenant = await tenantRepository.findById(user.tenantId);
      if (!tenant || tenant.status !== "active") {
        res.status(401).json({ error: "Empresa inativa ou suspensa" });
        return;
      }
      
      req.user = {
        id: user.id,
        email: user.email,
        tenantId: user.tenantId,
        role: user.role,
        status: user.status,
      };
      
      next();
    } catch (err) {
      res.status(401).json({ error: "Token inválido ou expirado" });
      return;
    }
  };
};
