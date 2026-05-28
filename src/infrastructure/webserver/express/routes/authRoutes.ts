import { Router } from "express";
import { AuthController } from "../../../../interface/controllers/AuthController";
import { asyncHandler } from "../utils/AsyncHandler";
import { validate } from "../middlewares/ValidationMiddleware";
import { RegisterUserSchema, LoginUserSchema } from "../../../../domain/schemas/AuthSchema";

import { RequestHandler } from "express";

export const createAuthRoutes = (authController: AuthController, authMiddleware: any, authLimiter: RequestHandler): Router => {
  const router = Router();

  router.post(
    "/register", 
    authLimiter,
    validate(RegisterUserSchema), 
    asyncHandler((req: any, res: any) => authController.register(req, res))
  );

  router.post(
    "/login", 
    authLimiter,
    validate(LoginUserSchema), 
    asyncHandler((req: any, res: any) => authController.login(req, res))
  );

  router.get(
    "/me",
    authMiddleware,
    asyncHandler((req: any, res: any) => authController.me(req, res))
  );

  router.patch(
    "/tenant/fees",
    authMiddleware,
    asyncHandler((req: any, res: any) => authController.updateTenantFees(req, res))
  );

  return router;
}

