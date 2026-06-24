import { IEmailService } from "../../application/protocols/IEmailService";

export class ConsoleEmailService implements IEmailService {
  async sendVerificationEmail(email: string, code: string): Promise<void> {
    console.log("\n========================================================");
    console.log("📧 [SIMULAÇÃO DE E-MAIL] CÓDIGO DE VERIFICAÇÃO GERADO!");
    console.log(`Para: \x1b[36m${email}\x1b[0m`);
    console.log("--------------------------------------------------------");
    console.log(`🔑 Seu código de ativação é: \x1b[1m\x1b[33m${code}\x1b[0m`);
    console.log("Expira em: 15 minutos.");
    console.log("========================================================\n");
  }

  async sendPasswordResetEmail(email: string, code: string): Promise<void> {
    console.log("\n========================================================");
    console.log("📧 [SIMULAÇÃO DE E-MAIL] RECUPERAÇÃO DE SENHA SOLICITADA!");
    console.log(`Para: \x1b[36m${email}\x1b[0m`);
    console.log("--------------------------------------------------------");
    console.log(`🔑 Seu código de redefinição de senha é: \x1b[1m\x1b[33m${code}\x1b[0m`);
    console.log("Expira em: 15 minutos.");
    console.log("========================================================\n");
  }
}
