import { IUserRepository } from "../../repositories/IUserRepository";
import { IEmailService } from "../../protocols/IEmailService";

export interface SendPasswordResetCodeInput {
  email: string;
}

export class SendPasswordResetCode {
  constructor(
    private userRepository: IUserRepository,
    private emailService: IEmailService
  ) {}

  async execute({ email }: SendPasswordResetCodeInput): Promise<{ success: boolean }> {
    const cleanEmail = email.toLowerCase().trim();

    const user = await this.userRepository.findByEmail(cleanEmail);
    if (!user) {
      throw new Error("Nenhum usuário cadastrado com este e-mail.");
    }

    // Generate 6-digit OTP code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    user.passwordResetCode = resetCode;
    user.passwordResetExpiresAt = resetExpiresAt;

    await this.userRepository.save(user);

    await this.emailService.sendPasswordResetEmail(cleanEmail, resetCode);

    return { success: true };
  }
}
