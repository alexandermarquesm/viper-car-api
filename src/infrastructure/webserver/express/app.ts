import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createServiceRoutes } from "./routes/serviceRoutes";
import { createClientRoutes } from "./routes/clientRoutes";
import { createAuthRoutes } from "./routes/authRoutes";
import { createSubscriptionRoutes } from "./routes/subscriptionRoutes";
import { ServiceController } from "../../../interface/controllers/ServiceController";
import { ClientController } from "../../../interface/controllers/ClientController";
import { AuthController } from "../../../interface/controllers/AuthController";
import { SubscriptionController } from "../../../interface/controllers/SubscriptionController";
import { errorHandler } from "./middlewares/ErrorHandler";
import { createAuthMiddleware } from "./middlewares/AuthMiddleware";
import { loggerMiddleware } from "./middlewares/LoggerMiddleware";
import { asyncHandler } from "./utils/AsyncHandler";
import { WebhookController } from "../../../interface/controllers/WebhookController";
import { ITenantRepository } from "../../../application/repositories/ITenantRepository";
import { createSubscriptionMiddleware } from "./middlewares/SubscriptionMiddleware";

import { IUserRepository } from "../../../application/repositories/IUserRepository";

export const createApp = (
  serviceController: ServiceController,
  clientController: ClientController,
  authController: AuthController,
  webhookController: WebhookController,
  subscriptionController: SubscriptionController,
  tenantRepository: ITenantRepository,
  userRepository: IUserRepository,
  jwtSecret: string
): Express => {
  const app = express();
  const authMiddleware = createAuthMiddleware(jwtSecret, userRepository);
  const subscriptionMiddleware = createSubscriptionMiddleware(tenantRepository);
  
  // Security Middlewares
  app.use(helmet());
  app.use(
    cors({
      origin: ["https://vipcar.com.br", "http://localhost:3000", "http://localhost:8081", "exp://localhost:8081"], // Add frontend URLs and Expo origins here
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      credentials: true,
    })
  );

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { error: "Muitas requisições deste IP, tente novamente em 15 minutos." },
  });
  app.use(limiter);

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

  // Domain Routes (Protected & Subscription Required)
  app.get("/backup", authMiddleware, subscriptionMiddleware, asyncHandler((req: any, res: any) => serviceController.backup(req, res)));
  app.use("/services", authMiddleware, subscriptionMiddleware, createServiceRoutes(serviceController));
  app.use("/clients", authMiddleware, subscriptionMiddleware, createClientRoutes(clientController));
  
  // Subscription Routes (Protected, but does NOT require active subscription obviously)
  app.use("/subscriptions", authMiddleware, createSubscriptionRoutes(subscriptionController));

  // Error Handler (deve ser o último)
  app.use(errorHandler);


  return app;
};

