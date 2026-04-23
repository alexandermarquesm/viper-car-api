import { IUserRepository } from "../../repositories/IUserRepository";
import { ITenantRepository } from "../../repositories/ITenantRepository";

interface GetUserInfoRequest {
  userId: string;
}

export class GetUserInfo {
  constructor(
    private userRepository: IUserRepository,
    private tenantRepository: ITenantRepository
  ) {}

  async execute(request: GetUserInfoRequest) {
    const user = await this.userRepository.findById(request.userId);
    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const tenant = await this.tenantRepository.findById(user.tenantId);
    if (!tenant) {
      throw new Error("Tenant não encontrado");
    }

    return {
      user: {
        id: user.id,
        tenantId: user.tenantId,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        plan: tenant.plan,
        subscriptionStatus: tenant.subscriptionStatus,
        trialEndsAt: tenant.trialEndsAt,
      }
    };
  }
}
