import { IUserRepository } from "../../repositories/IUserRepository";

export interface VerifyPasswordResetCodeInput {
  email: string;
  code: string;
}

export class VerifyPasswordResetCode {
  constructor(private userRepository: IUserRepository) {}

  async execute({ email, code }: VerifyPasswordResetCodeInput): Promise<{ success: boolean }> {
    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code.trim();

    const user = await this.userRepository.findByEmail(cleanEmail);
    if (!user) {
      throw new Error("Usuário não encontrado.");
    }

    if (!user.passwordResetCode || user.passwordResetCode !== cleanCode) {
      throw new Error("Código de redefinição incorreto.");
    }

    if (user.passwordResetExpiresAt && new Date() > user.passwordResetExpiresAt) {
      throw new Error("Código de redefinição expirado.");
    }

    return { success: true };
  }
}
