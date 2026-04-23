import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { createServiceRoutes } from "./routes/serviceRoutes";
import { createClientRoutes } from "./routes/clientRoutes";
import { createAuthRoutes } from "./routes/authRoutes";
import { ServiceController } from "../../../interface/controllers/ServiceController";
import { ClientController } from "../../../interface/controllers/ClientController";
import { AuthController } from "../../../interface/controllers/AuthController";
import { errorHandler } from "./middlewares/ErrorHandler";
import { createAuthMiddleware } from "./middlewares/AuthMiddleware";
import { loggerMiddleware } from "./middlewares/LoggerMiddleware";
import { asyncHandler } from "./utils/AsyncHandler";
import { WebhookController } from "../../../interface/controllers/WebhookController";

export const createApp = (
  serviceController: ServiceController,
  clientController: ClientController,
  authController: AuthController,
  webhookController: WebhookController,
  jwtSecret: string
): Express => {
  const app = express();
  const authMiddleware = createAuthMiddleware(jwtSecret);
  
  // Security Middlewares
  app.use(helmet());
  app.use(cors());

  // Webhook Route (RAW BODY required for signature verification)
  app.post(
    "/webhooks/lemon-squeezy", 
    express.raw({ type: "application/json" }),
    asyncHandler((req: Request, res: Response) => webhookController.handleLemonSqueezy(req, res))
  );

  app.use(express.json());
  app.use(loggerMiddleware);

  // Health Check
  app.get("/", (req: Request, res: Response) => {
    res.send("VIP CAR Backend (TypeScript + Clean Architecture) está rodando! 🚗💨");
  });

  // Auth Routes (Public)
  app.use("/auth", createAuthRoutes(authController, authMiddleware));

  // Domain Routes (Protected)
  app.get("/backup", authMiddleware, asyncHandler((req: any, res: any) => serviceController.backup(req, res)));
  app.use("/services", authMiddleware, createServiceRoutes(serviceController));
  app.use("/clients", authMiddleware, createClientRoutes(clientController));

  // Error Handler (deve ser o último)
  app.use(errorHandler);


  return app;
};
