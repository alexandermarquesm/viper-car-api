import { SubscriptionController } from "../../../interface/controllers/SubscriptionController";
import { CreateCheckout } from "../../../application/use-cases/Subscription/CreateCheckout";

export const makeSubscriptionController = (): SubscriptionController => {
  const createCheckout = new CreateCheckout();
  return new SubscriptionController(createCheckout);
};
