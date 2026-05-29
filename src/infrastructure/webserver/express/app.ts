import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createServiceRoutes } from "./routes/serviceRoutes";
import { createClientRoutes } from "./routes/clientRoutes";
import { createAuthRoutes } from "./routes/authRoutes";
import { createSubscriptionRoutes } from "./routes/subscriptionRoutes";
import { createTeamRoutes } from "./routes/teamRoutes";
import { createExpenseRoutes } from "./routes/expenseRoutes";
import { ServiceController } from "../../../interface/controllers/ServiceController";
import { ClientController } from "../../../interface/controllers/ClientController";
import { AuthController } from "../../../interface/controllers/AuthController";
import { SubscriptionController } from "../../../interface/controllers/SubscriptionController";
import { TeamController } from "../../../interface/controllers/TeamController";
import { ExpenseController } from "../../../interface/controllers/ExpenseController";
import { errorHandler } from "./middlewares/ErrorHandler";
import { createAuthMiddleware } from "./middlewares/AuthMiddleware";
import { activeUserMiddleware } from "./middlewares/ActiveUserMiddleware";
import { loggerMiddleware } from "./middlewares/LoggerMiddleware";
import { asyncHandler } from "./utils/AsyncHandler";
import { WebhookController } from "../../../interface/controllers/WebhookController";
import { ITenantRepository } from "../../../application/repositories/ITenantRepository";
import { createSubscriptionMiddleware } from "./middlewares/SubscriptionMiddleware";
import { createPlanLimitMiddleware } from "./middlewares/PlanLimitMiddleware";

import { IUserRepository } from "../../../application/repositories/IUserRepository";

export const createApp = (
  serviceController: ServiceController,
  clientController: ClientController,
  authController: AuthController,
  webhookController: WebhookController,
  subscriptionController: SubscriptionController,
  teamController: TeamController,
  expenseController: ExpenseController,
  tenantRepository: ITenantRepository,
  userRepository: IUserRepository,
  jwtSecret: string
): Express => {
  const app = express();
  app.set("trust proxy", 1);
  const authMiddleware = createAuthMiddleware(jwtSecret, userRepository, tenantRepository);
  const subscriptionMiddleware = createSubscriptionMiddleware(tenantRepository);
  const planLimitMiddleware = createPlanLimitMiddleware(tenantRepository);
  
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

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per 15 minutes for auth
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Muitas tentativas de login ou registro, tente novamente mais tarde." },
  });

  // Webhook Route — Stripe (RAW BODY obrigatório para verificação de assinatura)
  app.post(
    "/webhooks/stripe",
    express.raw({ type: "application/json" }),
    asyncHandler((req: Request, res: Response) => webhookController.handleStripe(req, res))
  );

  app.use(express.json());
  app.use(loggerMiddleware);

  // Health Check
  app.get("/", (req: Request, res: Response) => {
    res.send("VIP CAR Backend (TypeScript + Clean Architecture) está rodando! 🚗💨");
  });

  // Auth Routes (Public)
  app.use("/auth", createAuthRoutes(authController, authMiddleware, authLimiter));

  // Domain Routes (Protected & Subscription Required & Active status enforced)
  app.get("/backup", authMiddleware, activeUserMiddleware, subscriptionMiddleware, planLimitMiddleware("reports"), asyncHandler((req: any, res: any) => serviceController.backup(req, res)));
  app.use("/services", authMiddleware, activeUserMiddleware, subscriptionMiddleware, createServiceRoutes(serviceController, planLimitMiddleware));
  app.use("/clients", authMiddleware, activeUserMiddleware, subscriptionMiddleware, createClientRoutes(clientController));
  app.use("/team", authMiddleware, activeUserMiddleware, subscriptionMiddleware, createTeamRoutes(teamController));
  app.use("/expenses", authMiddleware, activeUserMiddleware, subscriptionMiddleware, planLimitMiddleware("expenses"), createExpenseRoutes(expenseController));
  
  // Subscription Routes (Protected, but does NOT require active subscription obviously)
  app.use("/subscriptions", authMiddleware, createSubscriptionRoutes(subscriptionController));

  // Error Handler (deve ser o último)
  app.use(errorHandler);


  return app;
};

