import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { IUserRepository } from "../../../../application/repositories/IUserRepository";

export interface AuthenticatedRequest<
  P = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: {
    id: string;
    tenantId: string;
    role: string;
  };
}

export const createAuthMiddleware = (jwtSecret: string, userRepository: IUserRepository) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: "Token não fornecido" });
      return;
    }

    const [, token] = authHeader.split(" ");

    try {
      const decoded = jwt.verify(token, jwtSecret) as any;
      
      // Busca ultraleve no banco para garantir que o usuário ainda existe e está ativo
      const user = await userRepository.findById(decoded.id);
      
      if (!user) {
        res.status(401).json({ error: "Usuário não encontrado no banco de dados" });
        return;
      }

      if (user.status !== "active") {
        res.status(401).json({ error: "Usuário inativo ou banido" });
        return;
      }
      
      req.user = {
        id: user.id,
        tenantId: user.tenantId,
        role: user.role,
      };
      
      next();
    } catch (err) {
      res.status(401).json({ error: "Token inválido ou expirado" });
      return;
    }
  };
};
