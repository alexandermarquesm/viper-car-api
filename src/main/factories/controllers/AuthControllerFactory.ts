import { AuthController } from "../../../interface/controllers/AuthController";
import { RegisterTenant } from "../../../application/use-cases/Auth/RegisterTenant";
import { LoginUser } from "../../../application/use-cases/Auth/LoginUser";
import { GetUserInfo } from "../../../application/use-cases/Auth/GetUserInfo";
import { VerifyEmail } from "../../../application/use-cases/Auth/VerifyEmail";
import { ResendVerificationCode } from "../../../application/use-cases/Auth/ResendVerificationCode";
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

  return new AuthController(
    registerTenant,
    loginUser,
    getUserInfo,
    tenantRepository,
    verifyEmail,
    resendVerificationCode
  );
};
