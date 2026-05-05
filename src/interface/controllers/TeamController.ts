import { Response } from "express";
import { AuthenticatedRequest } from "../../infrastructure/webserver/express/middlewares/AuthMiddleware";
import { IUserRepository } from "../../application/repositories/IUserRepository";
import { AppError } from "../../infrastructure/errors/AppError";
import InviteModel from "../../infrastructure/database/mongoose-models/InviteModel";
import TenantModel from "../../infrastructure/database/mongoose-models/TenantModel";
import crypto from "crypto";

export class TeamController {
  constructor(private userRepository: IUserRepository) {}

  async inviteMember(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { email } = req.body;
    const tenantId = req.user!.tenantId;

    if (!email) {
      throw new AppError("O e-mail é obrigatório", 400);
    }

    const cleanEmail = email.toLowerCase().trim();

    // Verify if user exists
    const userToInvite = await this.userRepository.findByEmail(cleanEmail);
    if (!userToInvite) {
      throw new AppError("Não existe uma conta registrada com este e-mail. Peça para o funcionário criar uma conta no app primeiro.", 404);
    }

    if (userToInvite.tenantId === tenantId) {
      throw new AppError("Este usuário já pertence à sua equipe.", 409);
    }

    // Get Tenant Name
    const tenant = await TenantModel.findById(tenantId);
    if (!tenant) {
      throw new AppError("Empresa não encontrada", 404);
    }

    // Check for existing pending invites
    const existingInvite = await InviteModel.findOne({ email: cleanEmail, tenantId, status: "pending" });
    if (existingInvite) {
      throw new AppError("Já existe um convite pendente para este usuário.", 409);
    }

    const invite = await InviteModel.create({
      email: cleanEmail,
      tenantId,
      tenantName: tenant.name,
      status: "pending",
    });

    res.status(201).json(invite);
  }

  async listMembers(req: AuthenticatedRequest, res: Response): Promise<void> {
    const tenantId = req.user!.tenantId;
    
    // Pega os membros ativos
    const members = await this.userRepository.findAllByTenantId(tenantId);
    const safeMembers = members.map(m => ({
      id: m.id,
      name: m.name,
      email: m.email,
      role: m.role,
      status: m.status,
    }));

    // Pega os convites pendentes que o dono enviou
    const pendingInvites = await InviteModel.find({ tenantId, status: "pending" });

    res.json({ members: safeMembers, invites: pendingInvites });
  }

  async removeMember(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const tenantId = req.user!.tenantId;

    if (id === req.user!.id) {
      throw new AppError("Você não pode remover a si mesmo", 400);
    }

    const member = await this.userRepository.findById(id);
    if (!member || member.tenantId !== tenantId) {
      throw new AppError("Membro não encontrado na sua equipe", 404);
    }

    // Como o usuário tem a conta dele, se removermos, não deletamos do banco,
    // apenas retornamos ele pro seu "estado isolado" (usando o id dele mesmo como tenantId, ou algo que invalide o acesso aos dados do dono).
    // O mais seguro para um "revert": criar um tenantId fantasma para ele ou simplesmente banir. 
    // Mas ele tem o tenantId original dele (que seria o proprio user ID na criacao original).
    // Como nao salvamos o tenant anterior, vamos criar um novo tenant "isolado" para ele.
    const newTenant = await TenantModel.create({
      _id: crypto.randomUUID(),
      name: `Conta Isolada (${member.name})`,
      plan: "trial",
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    member.tenantId = newTenant._id.toString();
    member.role = "owner";
    await this.userRepository.save(member);

    res.status(204).send();
  }

  // --- Worker Actions --- //

  async getMyInvites(req: AuthenticatedRequest, res: Response): Promise<void> {
    const email = req.user?.email || ""; // We don't have email in auth payload currently, need to fetch user
    
    const user = await this.userRepository.findById(req.user!.id);
    if (!user) throw new AppError("Usuário não encontrado", 404);

    const invites = await InviteModel.find({ email: user.email, status: "pending" });
    res.json(invites);
  }

  async acceptInvite(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    
    const user = await this.userRepository.findById(req.user!.id);
    if (!user) throw new AppError("Usuário não encontrado", 404);

    const invite = await InviteModel.findOne({ _id: id, email: user.email, status: "pending" });
    if (!invite) {
      throw new AppError("Convite não encontrado ou já expirado", 404);
    }

    // Accept invite
    invite.status = "accepted";
    await invite.save();

    // Update user to point to new tenant and set role to worker
    user.tenantId = invite.tenantId.toString();
    user.role = "worker";
    await this.userRepository.save(user);

    // Cancelar outros convites pendentes do mesmo email (opcional, mas boa pratica)
    await InviteModel.updateMany({ email: user.email, status: "pending" }, { status: "rejected" });

    res.json({ success: true, message: "Bem-vindo à nova equipe!", newTenantId: user.tenantId });
  }

  async rejectInvite(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    
    const user = await this.userRepository.findById(req.user!.id);
    if (!user) throw new AppError("Usuário não encontrado", 404);

    const invite = await InviteModel.findOne({ _id: id, email: user.email, status: "pending" });
    if (!invite) {
      throw new AppError("Convite não encontrado", 404);
    }

    invite.status = "rejected";
    await invite.save();

    res.status(204).send();
  }
}
