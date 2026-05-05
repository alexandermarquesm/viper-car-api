import ngrok from "@ngrok/ngrok";
import dotenv from "dotenv";

dotenv.config();

async function start() {
  try {
    const session = await new ngrok.SessionBuilder()
      .authtokenFromEnv()
      .connect();
      
    const tunnel = await session.httpEndpoint()
      .listen();
      
    console.log("\x1b[36m%s\x1b[0m", "\n=========================================");
    console.log("\x1b[32m%s\x1b[0m", " 🚀 TÚNEL PROFISSIONAL ATIVO");
    console.log("\x1b[36m%s\x1b[0m", "=========================================");
    console.log("\x1b[33m%s\x1b[0m", ` 🔗 URL: ${tunnel.url()}`);
    console.log("\x1b[36m%s\x1b[0m", "=========================================\n");
    
    tunnel.forward("http://localhost:3000");

    // Keep the process alive
    process.stdin.resume();
  } catch (error) {
    console.error("❌ Erro ao iniciar o túnel:", error);
    process.exit(1);
  }
}

start();
