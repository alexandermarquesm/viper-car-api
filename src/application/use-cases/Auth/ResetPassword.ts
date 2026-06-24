import { IUserRepository } from "../../repositories/IUserRepository";
import bcrypt from "bcryptjs";

export interface ResetPasswordInput {
  email: string;
  code: string;
  passwordRaw: string;
}

export class ResetPassword {
  constructor(private userRepository: IUserRepository) {}

  async execute({ email, code, passwordRaw }: ResetPasswordInput): Promise<{ success: boolean }> {
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

    if (passwordRaw.length < 6) {
      throw new Error("A senha deve conter no mínimo 6 caracteres.");
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordRaw, salt);

    user.passwordHash = passwordHash;
    user.passwordResetCode = undefined;
    user.passwordResetExpiresAt = undefined;
    
    // Invalidate old tokens/sessions
    user.tokenVersion = (user.tokenVersion || 0) + 1;

    await this.userRepository.save(user);

    return { success: true };
  }
}
