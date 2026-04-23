import { Router } from "express";
import { AuthController } from "../../../../interface/controllers/AuthController";
import { asyncHandler } from "../utils/AsyncHandler";
import { validate } from "../middlewares/ValidationMiddleware";
import { RegisterUserSchema, LoginUserSchema } from "../../../../domain/schemas/AuthSchema";

export const createAuthRoutes = (authController: AuthController, authMiddleware: any): Router => {
  const router = Router();

  router.post(
    "/register", 
    validate(RegisterUserSchema), 
    asyncHandler((req: any, res: any) => authController.register(req, res))
  );

  router.post(
    "/login", 
    validate(LoginUserSchema), 
    asyncHandler((req: any, res: any) => authController.login(req, res))
  );

  router.get(
    "/me",
    authMiddleware,
    asyncHandler((req: any, res: any) => authController.me(req, res))
  );

  return router;
}

