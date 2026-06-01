import { IUserRepository } from "../../repositories/IUserRepository";
import { IEmailService } from "../../protocols/IEmailService";

export interface ResendVerificationCodeInput {
  email: string;
}

export class ResendVerificationCode {
  constructor(
    private userRepository: IUserRepository,
    private emailService: IEmailService
  ) {}

  async execute({ email }: ResendVerificationCodeInput) {
    const cleanEmail = email.toLowerCase().trim();

    const user = await this.userRepository.findByEmail(cleanEmail);
    if (!user) {
      throw new Error("Usuário não encontrado.");
    }

    if (user.isEmailVerified) {
      throw new Error("Este e-mail já está confirmado.");
    }

    // Generate new OTP
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.emailVerificationCode = newCode;
    user.emailVerificationExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await this.userRepository.save(user);

    // Send email
    await this.emailService.sendVerificationEmail(cleanEmail, newCode);

    return {
      success: true,
      message: "Código reenviado com sucesso.",
    };
  }
}
