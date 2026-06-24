import { Tenant } from "../../../domain/entities/Tenant";
import { User } from "../../../domain/entities/User";
import { ITenantRepository } from "../../repositories/ITenantRepository";
import { IUserRepository } from "../../repositories/IUserRepository";
import { IEmailService } from "../../protocols/IEmailService";
import bcrypt from "bcryptjs";

export interface RegisterTenantInput {
  tenantName?: string;
  document?: string;
  userName: string;
  email: string;
  passwordRaw: string;
  role?: "owner" | "worker";
  inviteCode?: string;
}

export class RegisterTenant {
  constructor(
    private tenantRepository: ITenantRepository,
    private userRepository: IUserRepository,
    private emailService: IEmailService
  ) {}

  async execute(input: RegisterTenantInput) {
    // Check if email is already taken
    const cleanEmail = input.email.toLowerCase().trim();
    const existingUser = await this.userRepository.findByEmail(cleanEmail);
    if (existingUser) {
      throw new Error("Este e-mail já está em uso.");
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.passwordRaw, salt);

    // Generate 6-digit OTP code
    const emailVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const emailVerificationExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    if (input.role === "worker") {
      if (!input.inviteCode) {
        throw new Error("Código de convite é obrigatório para colaboradores.");
      }
      const tenant = await this.tenantRepository.findByInviteCode(input.inviteCode);
      if (!tenant) {
        throw new Error("Código de convite inválido ou estabelecimento não encontrado.");
      }

      // Create Worker User for this Tenant (status = pending)
      const user = new User({
        tenantId: tenant.id,
        name: input.userName,
        email: input.email,
        passwordHash,
        role: "worker",
        status: "pending",
        isEmailVerified: false,
        emailVerificationCode,
        emailVerificationExpiresAt,
      });
      const savedUser = await this.userRepository.save(user);

      await this.emailService.sendVerificationEmail(cleanEmail, emailVerificationCode);

      return {
        success: true,
        tenantId: tenant.id,
        userId: savedUser.id,
      };
    } else {
      // Owner Flow
      if (!input.tenantName) {
        throw new Error("O nome da empresa é obrigatório para proprietários.");
      }
      // 1. Create Tenant (defaults to 7 days trial in entity constructor)
      const tenant = new Tenant({
        name: input.tenantName,
      });
      const savedTenant = await this.tenantRepository.save(tenant);

      // 3. Create Admin User for this Tenant
      const user = new User({
        tenantId: savedTenant.id,
        name: input.userName,
        email: input.email,
        passwordHash,
        role: "owner",
        status: "active",
        isEmailVerified: false,
        emailVerificationCode,
        emailVerificationExpiresAt,
      });
      const savedUser = await this.userRepository.save(user);

      await this.emailService.sendVerificationEmail(cleanEmail, emailVerificationCode);

      return {
        success: true,
        tenantId: savedTenant.id,
        userId: savedUser.id,
      };
    }
  }
}
