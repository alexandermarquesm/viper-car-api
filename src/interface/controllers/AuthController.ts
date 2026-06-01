import { Request, Response } from "express";
import { RegisterTenant } from "../../application/use-cases/Auth/RegisterTenant";
import { LoginUser } from "../../application/use-cases/Auth/LoginUser";
import { GetUserInfo } from "../../application/use-cases/Auth/GetUserInfo";
import { VerifyEmail } from "../../application/use-cases/Auth/VerifyEmail";
import { ResendVerificationCode } from "../../application/use-cases/Auth/ResendVerificationCode";
import { AppError } from "../../infrastructure/errors/AppError";
import { ITenantRepository } from "../../application/repositories/ITenantRepository";

export class AuthController {
  constructor(
    private registerTenant: RegisterTenant,
    private loginUser: LoginUser,
    private getUserInfo: GetUserInfo,
    private tenantRepository: ITenantRepository,
    private verifyEmailUseCase: VerifyEmail,
    private resendVerificationCodeUseCase: ResendVerificationCode
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    const { tenantName, document, userName, email, passwordRaw, role, inviteCode } = req.body;
    
    try {
      const result = await this.registerTenant.execute({
        tenantName,
        document,
        userName,
        email,
        passwordRaw,
        role,
        inviteCode,
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
      if (error.message === "EMAIL_NOT_VERIFIED") {
        throw new AppError("EMAIL_NOT_VERIFIED", 403);
      }
      if (error.message.includes("incorretos") || error.message.includes("inativo") || error.message.includes("corrompida")) {
        throw new AppError(error.message, 401);
      }
      throw error;
    }
  }

  async verifyEmail(req: Request, res: Response): Promise<void> {
    const { email, code } = req.body;
    if (!email || !code) {
      throw new AppError("E-mail e código de verificação são obrigatórios.", 400);
    }

    try {
      const result = await this.verifyEmailUseCase.execute({ email, code });
      res.json(result);
    } catch (error: any) {
      throw new AppError(error.message, 400);
    }
  }

  async resendCode(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    if (!email) {
      throw new AppError("E-mail é obrigatório.", 400);
    }

    try {
      const result = await this.resendVerificationCodeUseCase.execute({ email });
      res.json(result);
    } catch (error: any) {
      throw new AppError(error.message, 400);
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

  async updateTenantFees(req: Request, res: Response): Promise<void> {
    const authenticatedReq = req as any;
    const userId = authenticatedReq.user?.id;
    const role = authenticatedReq.user?.role;
    const tenantId = authenticatedReq.user?.tenantId;

    if (!userId || !tenantId) {
      throw new AppError("Não autenticado", 401);
    }

    if (role !== "owner") {
      throw new AppError("Apenas o proprietário do negócio pode alterar as taxas.", 403);
    }

    const { creditCardFee, debitCardFee } = req.body;

    if (typeof creditCardFee !== "number" || typeof debitCardFee !== "number") {
      throw new AppError("Taxas inválidas.", 400);
    }

    try {
      const tenant = await this.tenantRepository.findById(tenantId);
      if (!tenant) {
        throw new AppError("Empresa não encontrada.", 404);
      }

      tenant.creditCardFee = creditCardFee;
      tenant.debitCardFee = debitCardFee;

      await this.tenantRepository.save(tenant);

      res.json({
        success: true,
        tenant: {
          id: tenant.id,
          name: tenant.name,
          plan: tenant.plan,
          subscriptionStatus: tenant.subscriptionStatus,
          trialEndsAt: tenant.trialEndsAt,
          currentPeriodEnd: tenant.currentPeriodEnd,
          creditCardFee: tenant.creditCardFee,
          debitCardFee: tenant.debitCardFee,
        }
      });
    } catch (error: any) {
      throw new AppError(error.message, 500);
    }
  }
}

