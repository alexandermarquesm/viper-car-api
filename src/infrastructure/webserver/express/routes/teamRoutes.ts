import { Router } from "express";
import { TeamController } from "../../../../interface/controllers/TeamController";
import { asyncHandler } from "../utils/AsyncHandler";
import { requireRole } from "../middlewares/RoleMiddleware";

export const createTeamRoutes = (teamController: TeamController): Router => {
  const router = Router();

  router.post(
    "/invite",
    requireRole(["owner"]),
    asyncHandler((req: any, res: any) => teamController.inviteMember(req, res))
  );

  router.get(
    "/",
    requireRole(["owner"]),
    asyncHandler((req: any, res: any) => teamController.listMembers(req, res))
  );

  router.delete(
    "/:id",
    requireRole(["owner"]),
    asyncHandler((req: any, res: any) => teamController.removeMember(req, res))
  );

  // --- Worker Actions --- //
  
  router.get(
    "/invites",
    asyncHandler((req: any, res: any) => teamController.getMyInvites(req, res))
  );

  router.post(
    "/invites/:id/accept",
    asyncHandler((req: any, res: any) => teamController.acceptInvite(req, res))
  );

  router.post(
    "/invites/:id/reject",
    asyncHandler((req: any, res: any) => teamController.rejectInvite(req, res))
  );

  return router;
};
