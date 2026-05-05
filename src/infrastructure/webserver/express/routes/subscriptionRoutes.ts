import { Router } from "express";
import { SubscriptionController } from "../../../../interface/controllers/SubscriptionController";
import { asyncHandler } from "../utils/AsyncHandler";

export const createSubscriptionRoutes = (subscriptionController: SubscriptionController): Router => {
  const router = Router();

  router.post("/checkout", asyncHandler((req, res) => subscriptionController.checkout(req, res)));

  return router;
};
