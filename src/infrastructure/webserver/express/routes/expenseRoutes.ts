import { Router } from "express";
import { ExpenseController } from "../../../../interface/controllers/ExpenseController";
import { asyncHandler } from "../utils/AsyncHandler";
import { requireRole } from "../middlewares/RoleMiddleware";

export const createExpenseRoutes = (expenseController: ExpenseController): Router => {
  const router = Router();

  // Enforce owner / admin role for financial access
  router.use(requireRole(["owner", "admin"]));

  router.get("/", asyncHandler((req: any, res: any) => expenseController.list(req, res)));
  router.post("/", asyncHandler((req: any, res: any) => expenseController.create(req, res)));
  router.delete("/:id", asyncHandler((req: any, res: any) => expenseController.delete(req, res)));

  return router;
};
