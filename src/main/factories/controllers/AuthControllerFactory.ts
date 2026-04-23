import { AuthController } from "../../../interface/controllers/AuthController";
import { RegisterTenant } from "../../../application/use-cases/Auth/RegisterTenant";
import { LoginUser } from "../../../application/use-cases/Auth/LoginUser";
import { GetUserInfo } from "../../../application/use-cases/Auth/GetUserInfo";
import { MongooseTenantRepository } from "../../../interface/repositories/MongooseTenantRepository";
import { MongooseUserRepository } from "../../../interface/repositories/MongooseUserRepository";

export const makeAuthController = (jwtSecret: string): AuthController => {
  const tenantRepository = new MongooseTenantRepository();
  const userRepository = new MongooseUserRepository();

  const registerTenant = new RegisterTenant(tenantRepository, userRepository);
  const loginUser = new LoginUser(userRepository, tenantRepository, jwtSecret);
  const getUserInfo = new GetUserInfo(userRepository, tenantRepository);

  return new AuthController(registerTenant, loginUser, getUserInfo);
};
