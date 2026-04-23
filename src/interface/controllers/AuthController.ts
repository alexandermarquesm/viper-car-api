import { Request, Response } from "express";
import { RegisterTenant } from "../../application/use-cases/Auth/RegisterTenant";
import { LoginUser } from "../../application/use-cases/Auth/LoginUser";
import { GetUserInfo } from "../../application/use-cases/Auth/GetUserInfo";
import { AppError } from "../../infrastructure/errors/AppError";

export class AuthController {
  constructor(
    private registerTenant: RegisterTenant,
    private loginUser: LoginUser,
    private getUserInfo: GetUserInfo
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    const { tenantName, document, userName, email, passwordRaw } = req.body;
    
    try {
      const result = await this.registerTenant.execute({
        tenantName,
        document,
        userName,
        email,
        passwordRaw,
      });
      res.status(201).json(result);
    } catch (error: any) {
      if (error.message.includes("já está em uso")) {
        throw new AppError(error.message, 409);
      }
      throw error;
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, passwordRaw } = req.body;
      const result = await this.loginUser.execute({ email, passwordRaw });
      res.json(result);
    } catch (error: any) {
      if (error.message.includes("incorretos") || error.message.includes("inativo")) {
        throw new AppError(error.message, 401);
      }
      throw error;
    }
  }

  async me(req: Request, res: Response): Promise<void> {
    const authenticatedReq = req as any;
    const userId = authenticatedReq.user?.id;

    if (!userId) {
      throw new AppError("Não autenticado", 401);
    }

    try {
      const result = await this.getUserInfo.execute({ userId });
      res.json(result);
    } catch (error: any) {
      throw new AppError(error.message, 404);
    }
  }
}

