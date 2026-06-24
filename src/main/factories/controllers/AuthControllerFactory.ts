import { AuthController } from "../../../interface/controllers/AuthController";
import { RegisterTenant } from "../../../application/use-cases/Auth/RegisterTenant";
import { LoginUser } from "../../../application/use-cases/Auth/LoginUser";
import { GetUserInfo } from "../../../application/use-cases/Auth/GetUserInfo";
import { VerifyEmail } from "../../../application/use-cases/Auth/VerifyEmail";
import { ResendVerificationCode } from "../../../application/use-cases/Auth/ResendVerificationCode";
import { SendPasswordResetCode } from "../../../application/use-cases/Auth/SendPasswordResetCode";
import { VerifyPasswordResetCode } from "../../../application/use-cases/Auth/VerifyPasswordResetCode";
import { ResetPassword } from "../../../application/use-cases/Auth/ResetPassword";
import { MongooseTenantRepository } from "../../../interface/repositories/MongooseTenantRepository";
import { MongooseUserRepository } from "../../../interface/repositories/MongooseUserRepository";
import { ResendEmailService } from "../../../infrastructure/providers/ResendEmailService";

export const makeAuthController = (jwtSecret: string): AuthController => {
  const tenantRepository = new MongooseTenantRepository();
  const userRepository = new MongooseUserRepository();
  const emailService = new ResendEmailService();

  const registerTenant = new RegisterTenant(tenantRepository, userRepository, emailService);
  const loginUser = new LoginUser(userRepository, tenantRepository, jwtSecret);
  const getUserInfo = new GetUserInfo(userRepository, tenantRepository);
  const verifyEmail = new VerifyEmail(userRepository, tenantRepository, jwtSecret);
  const resendVerificationCode = new ResendVerificationCode(userRepository, emailService);
  const sendPasswordResetCode = new SendPasswordResetCode(userRepository, emailService);
  const verifyPasswordResetCode = new VerifyPasswordResetCode(userRepository);
  const resetPasswordUseCase = new ResetPassword(userRepository);

  return new AuthController(
    registerTenant,
    loginUser,
    getUserInfo,
    tenantRepository,
    verifyEmail,
    resendVerificationCode,
    sendPasswordResetCode,
    verifyPasswordResetCode,
    resetPasswordUseCase
  );
};
